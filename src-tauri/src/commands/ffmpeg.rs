use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FfmpegStatus {
    pub found: bool,
    pub path: String,
    pub version: String,
}

#[tauri::command]
pub async fn detect_ffmpeg(app: AppHandle) -> Result<FfmpegStatus, String> {
    let detector = crate::ffmpeg::detector::FfmpegDetector::new(&app);
    match detector.detect().await {
        Some(path) => {
            let version = detector.check_version(&path).await.unwrap_or_default();
            Ok(FfmpegStatus {
                found: true,
                path: path.to_string_lossy().to_string(),
                version,
            })
        }
        None => Ok(FfmpegStatus {
            found: false,
            path: String::new(),
            version: String::new(),
        }),
    }
}

#[tauri::command]
pub async fn check_ffmpeg_version(path: String) -> Result<String, String> {
    let output = tokio::process::Command::new(&path)
        .args(["-version"])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.lines().next().unwrap_or("").to_string())
    } else {
        Err("Failed to execute FFmpeg".to_string())
    }
}
