use lofty::file::AudioFile;
use lofty::file::TaggedFileExt;
use lofty::tag::Accessor;
use base64::Engine;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AudioInfo {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub year: Option<u32>,
    pub genre: Option<String>,
    pub track: Option<u32>,
    pub duration: f64,
    pub bitrate: u32,
    pub sample_rate: u32,
    pub channels: u32,
    pub bit_depth: Option<u32>,
    pub format: String,
    pub codec: Option<String>,
    pub file_size: u64,
    pub cover_art: Option<String>,
}

#[tauri::command]
pub async fn read_audio_info(app: AppHandle, file_path: String) -> Result<AudioInfo, String> {
    let path = Path::new(&file_path);
    let file_size = std::fs::metadata(path)
        .map(|m| m.len())
        .unwrap_or(0);

    // Try lofty for audio files
    match lofty::read_from_path(path) {
        Ok(tagged_file) => {
            let properties = tagged_file.properties();
            let tag = tagged_file
                .primary_tag()
                .or_else(|| tagged_file.first_tag());

            // Extract cover art
            let cover_art = tag.as_ref().and_then(|t| {
                t.pictures().first().map(|pic| {
                    format!(
                        "data:{};base64,{}",
                        pic.mime_type().map(|m| m.as_str()).unwrap_or("image/png"),
                        base64::engine::general_purpose::STANDARD.encode(pic.data())
                    )
                })
            });

            Ok(AudioInfo {
                title: tag.as_ref().and_then(|t| t.title().map(String::from)),
                artist: tag.as_ref().and_then(|t| t.artist().map(String::from)),
                album: tag.as_ref().and_then(|t| t.album().map(String::from)),
                year: tag.as_ref().and_then(|t| t.year()),
                genre: tag.as_ref().and_then(|t| t.genre().map(String::from)),
                track: tag.as_ref().and_then(|t| t.track()),
                duration: properties.duration().as_secs_f64(),
                bitrate: properties.audio_bitrate().unwrap_or(0) * 1000,
                sample_rate: properties.sample_rate().unwrap_or(0),
                channels: properties.channels().unwrap_or(0) as u32,
                bit_depth: properties.bit_depth().map(|b| b as u32),
                format: format!("{:?}", tagged_file.file_type()),
                codec: None,
                file_size,
                cover_art,
            })
        }
        Err(_) => {
            // Fallback to ffprobe for video files
            read_with_ffprobe(&app, &file_path, file_size).await
        }
    }
}

async fn read_with_ffprobe(app: &AppHandle, file_path: &str, file_size: u64) -> Result<AudioInfo, String> {
    let ffmpeg_path = crate::ffmpeg::detector::FfmpegDetector::new(app)
        .detect()
        .await
        .ok_or("FFmpeg not found")?;

    let ffprobe_path = ffmpeg_path
        .parent()
        .unwrap_or(&ffmpeg_path)
        .join("ffprobe")
        .with_extension(
            std::env::consts::EXE_SUFFIX
                .strip_prefix('.')
                .unwrap_or(std::env::consts::EXE_SUFFIX),
        );

    let output = tokio::process::Command::new(&ffprobe_path)
        .args([
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_streams",
            "-show_format",
            file_path,
        ])
        .output()
        .await
        .map_err(|e| format!("Failed to run ffprobe: {}", e))?;

    if !output.status.success() {
        return Err("ffprobe failed".to_string());
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse ffprobe output: {}", e))?;

    // Find audio stream
    let streams = json.get("streams").and_then(|s| s.as_array());
    let audio_stream = streams.and_then(|arr| {
        arr.iter().find(|s| {
            s.get("codec_type")
                .and_then(|t| t.as_str())
                .map(|t| t == "audio")
                .unwrap_or(false)
        })
    });

    let format_info = json.get("format");

    let duration = audio_stream
        .and_then(|s| s.get("duration").and_then(|d| d.as_str()).and_then(|d| d.parse::<f64>().ok()))
        .or_else(|| format_info.and_then(|f| f.get("duration").and_then(|d| d.as_str()).and_then(|d| d.parse::<f64>().ok())))
        .unwrap_or(0.0);

    let bitrate = audio_stream
        .and_then(|s| s.get("bit_rate").and_then(|b| b.as_str()).and_then(|b| b.parse::<u32>().ok()))
        .or_else(|| format_info.and_then(|f| f.get("bit_rate").and_then(|b| b.as_str()).and_then(|b| b.parse::<u32>().ok())))
        .unwrap_or(0);

    let sample_rate = audio_stream
        .and_then(|s| s.get("sample_rate").and_then(|r| r.as_str()).and_then(|r| r.parse::<u32>().ok()))
        .unwrap_or(0);

    let channels = audio_stream
        .and_then(|s| s.get("channels").and_then(|c| c.as_u64()))
        .unwrap_or(0) as u32;

    let codec = audio_stream
        .and_then(|s| s.get("codec_name").and_then(|c| c.as_str()))
        .map(String::from);

    let format_name = format_info
        .and_then(|f| f.get("format_name").and_then(|n| n.as_str()))
        .unwrap_or("unknown")
        .to_string();

    Ok(AudioInfo {
        title: None,
        artist: None,
        album: None,
        year: None,
        genre: None,
        track: None,
        duration,
        bitrate,
        sample_rate,
        channels,
        bit_depth: None,
        format: format_name,
        codec,
        file_size,
        cover_art: None,
    })
}