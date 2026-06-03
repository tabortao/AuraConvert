use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

use crate::converter::args_builder;
use crate::converter::format_config;
use crate::converter::smart_optimize;
use crate::ffmpeg::runner::FfmpegRunner;

pub struct ConversionState {
    pub runners: Mutex<HashMap<String, FfmpegRunner>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConvertFile {
    pub id: String,
    pub path: String,
    pub name: String,
    pub size: u64,
    pub duration: Option<f64>,
    pub extension: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum BitrateValue {
    Auto(String),
    Number(u32),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum SampleRateValue {
    Auto(String),
    Number(u32),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum ChannelsValue {
    Auto(String),
    Number(u32),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConvertParams {
    pub format: String,
    pub bitrate: BitrateValue,
    pub sample_rate: SampleRateValue,
    pub channels: ChannelsValue,
    pub bit_depth: Option<u32>,
    pub volume: u32,
    pub speed: f64,
    pub output_dir: Option<String>,
    pub filename_template: Option<String>,
}

fn resolve_bitrate(bitrate: &BitrateValue) -> Option<u32> {
    match bitrate {
        BitrateValue::Auto(s) if s == "copy" => None, // copy mode: no re-encode
        BitrateValue::Auto(_) => None, // auto: let smart optimize decide
        BitrateValue::Number(n) => Some(*n),
    }
}

fn resolve_sample_rate(sr: &SampleRateValue) -> Option<u32> {
    match sr {
        SampleRateValue::Auto(_) => None,
        SampleRateValue::Number(n) => Some(*n),
    }
}

fn resolve_channels(ch: &ChannelsValue) -> Option<u32> {
    match ch {
        ChannelsValue::Auto(_) => None,
        ChannelsValue::Number(n) => Some(*n),
    }
}

#[tauri::command]
pub async fn start_conversion(
    app: AppHandle,
    state: State<'_, ConversionState>,
    files: Vec<ConvertFile>,
    params: ConvertParams,
) -> Result<String, String> {
    let total = files.len();
    let mut completed: usize = 0;
    let start_time = std::time::Instant::now();

    // Get FFmpeg path
    let ffmpeg_path = crate::ffmpeg::detector::FfmpegDetector::new(&app)
        .detect()
        .await
        .ok_or("FFmpeg not found. Please configure FFmpeg path in settings.")?;

    let format_config = format_config::get_format_config(&params.format);

    for file in &files {
        let file_id = &file.id;
        let input_path = &file.path;

        // Read source audio info for smart optimization
        let source_info = crate::commands::audio_info::read_audio_info(app.clone(), input_path.clone()).await.ok();

        // Smart optimize parameters based on source file
        let (opt_bitrate, opt_sample_rate, opt_channels, opt_bit_depth) = if let Some(ref info) = source_info {
            let optimized = smart_optimize::optimize_params(
                info.bitrate,
                info.sample_rate,
                info.channels,
                info.bit_depth,
                &params.format,
            );
            (
                resolve_bitrate(&params.bitrate).or(optimized.recommended_bitrate),
                resolve_sample_rate(&params.sample_rate).or(Some(optimized.recommended_sample_rate)),
                resolve_channels(&params.channels).or(Some(optimized.recommended_channels)),
                params.bit_depth.or(info.bit_depth),
            )
        } else {
            (
                resolve_bitrate(&params.bitrate),
                resolve_sample_rate(&params.sample_rate),
                resolve_channels(&params.channels),
                params.bit_depth,
            )
        };

        // Build output path
        let output_path = crate::utils::path_utils::build_output_path(
            input_path,
            &format_config.extension,
            params.output_dir.as_deref(),
            params.filename_template.as_deref().unwrap_or("original"),
        )?;

        // Build FFmpeg args with optimized params
        let convert_params = args_builder::ConvertParams {
            format: params.format.clone(),
            bitrate: opt_bitrate,
            sample_rate: opt_sample_rate,
            channels: opt_channels,
            bit_depth: opt_bit_depth,
            volume: Some(params.volume),
            speed: Some(params.speed),
        };
        let args = args_builder::build_ffmpeg_args(
            input_path,
            &output_path,
            &convert_params,
            &format_config,
            file.extension == "mp4"
                || file.extension == "mkv"
                || file.extension == "avi"
                || file.extension == "mov"
                || file.extension == "wmv"
                || file.extension == "flv"
                || file.extension == "webm",
        );

        // Create runner and run
        let runner = FfmpegRunner::new(ffmpeg_path.to_string_lossy().to_string());
        state
            .runners
            .lock()
            .unwrap()
            .insert(file_id.clone(), runner.clone());

        // Emit start event
        let _ = app.emit(
            "file-status-changed",
            serde_json::json!({
                "fileId": file_id,
                "status": "converting",
            }),
        );

        let total_duration_us = file
            .duration
            .map(|d| (d * 1_000_000.0) as u64)
            .unwrap_or(0);

        match runner.run(args, &app, file_id, total_duration_us).await {
            Ok(_) => {
                let output_size = std::fs::metadata(&output_path)
                    .map(|m| m.len())
                    .unwrap_or(0);
                let compression_ratio = if file.size > 0 {
                    Some(output_size as f64 / file.size as f64)
                } else {
                    None
                };

                let _ = app.emit(
                    "file-completed",
                    serde_json::json!({
                        "fileId": file_id,
                        "status": "completed",
                        "outputPath": output_path,
                        "outputSize": output_size,
                        "compressionRatio": compression_ratio,
                    }),
                );
            }
            Err(e) if e == "cancelled" => {
                let _ = app.emit(
                    "file-status-changed",
                    serde_json::json!({
                        "fileId": file_id,
                        "status": "cancelled",
                    }),
                );
            }
            Err(e) => {
                let _ = app.emit(
                    "file-failed",
                    serde_json::json!({
                        "fileId": file_id,
                        "status": "failed",
                        "error": e,
                    }),
                );
            }
        }

        state.runners.lock().unwrap().remove(file_id);
        completed += 1;

        // Emit total progress
        let elapsed = start_time.elapsed().as_secs_f64();
        let eta = if completed > 0 && completed < total {
            elapsed / completed as f64 * (total - completed) as f64
        } else {
            0.0
        };

        let _ = app.emit(
            "total-progress",
            serde_json::json!({
                "completed": completed,
                "total": total,
                "percentage": completed as f64 / total as f64 * 100.0,
                "eta": eta,
            }),
        );
    }

    Ok("done".to_string())
}

#[tauri::command]
pub async fn cancel_conversion(state: State<'_, ConversionState>) -> Result<(), String> {
    let runners = state.runners.lock().unwrap();
    for (_, runner) in runners.iter() {
        runner.cancel();
    }
    Ok(())
}