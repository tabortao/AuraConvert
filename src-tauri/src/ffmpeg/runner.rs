use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::io::AsyncBufReadExt;
use tokio::process::Command;

use super::parser;

pub struct FfmpegRunner {
    ffmpeg_path: String,
    cancel_flag: Arc<AtomicBool>,
}

impl Clone for FfmpegRunner {
    fn clone(&self) -> Self {
        Self {
            ffmpeg_path: self.ffmpeg_path.clone(),
            cancel_flag: Arc::clone(&self.cancel_flag),
        }
    }
}

impl FfmpegRunner {
    pub fn new(ffmpeg_path: String) -> Self {
        Self {
            ffmpeg_path,
            cancel_flag: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn cancel(&self) {
        self.cancel_flag.store(true, Ordering::SeqCst);
    }

    pub async fn run(
        &self,
        args: Vec<String>,
        app: &AppHandle,
        file_id: &str,
        total_duration_us: u64,
    ) -> Result<(), String> {
        self.cancel_flag.store(false, Ordering::SeqCst);

        let mut cmd = Command::new(&self.ffmpeg_path);
        cmd.args(&args)
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped());

        // Windows: hide console window
        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

        let mut child = cmd
            .spawn()
            .map_err(|e| format!("Failed to start FFmpeg: {}", e))?;

        let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
        let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

        // Read stderr in background
        let stderr_handle = tokio::spawn(async move {
            let reader = tokio::io::BufReader::new(stderr);
            let mut lines = reader.lines();
            let mut output = String::new();
            while let Ok(Some(line)) = lines.next_line().await {
                output.push_str(&line);
                output.push('\n');
            }
            output
        });

        let reader = tokio::io::BufReader::new(stdout);
        let mut lines = reader.lines();

        while let Ok(Some(line)) = lines.next_line().await {
            if self.cancel_flag.load(Ordering::SeqCst) {
                let _ = child.kill().await;
                let _ = stderr_handle.await;
                return Err("cancelled".to_string());
            }

            if let Some(info) = parser::parse_progress_line(&line) {
                if info.is_complete {
                    break;
                }
                if let Some(time_us) = info.out_time_us {
                    let progress = parser::calculate_progress(time_us, total_duration_us);
                    let _ = app.emit(
                        "conversion-progress",
                        serde_json::json!({
                            "fileId": file_id,
                            "progress": progress,
                            "speed": info.speed,
                        }),
                    );
                }
            }
        }

        // Wait for process to complete
        let status = child.wait().await.map_err(|e| e.to_string())?;
        let stderr_output = stderr_handle.await.map_err(|e| e.to_string())?;

        if !status.success() {
            let error_lines: Vec<&str> = stderr_output.lines().collect();
            let meaningful_error = error_lines
                .iter()
                .find(|l| l.contains("Error") || l.contains("error"))
                .map(|l| l.to_string())
                .unwrap_or_else(|| stderr_output.trim().to_string());
            return Err(meaningful_error);
        }

        Ok(())
    }
}