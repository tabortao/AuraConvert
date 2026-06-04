use super::format_config::FormatConfig;

/// Conversion parameters
#[allow(dead_code)]
pub struct ConvertParams {
    pub format: String,
    pub bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
    pub bit_depth: Option<u32>,
    pub volume: Option<u32>,  // 10-400 (percentage)
    pub speed: Option<f64>,   // 0.25-4.00
}

/// Build FFmpeg command-line arguments from conversion parameters
pub fn build_ffmpeg_args(
    input_path: &str,
    output_path: &str,
    params: &ConvertParams,
    format_config: &FormatConfig,
    is_video: bool,
) -> Vec<String> {
    let mut args: Vec<String> = vec![
        "-hide_banner".to_string(),
        "-y".to_string(), // Overwrite output
        "-i".to_string(),
        input_path.to_string(),
    ];

    // For video files: extract audio only
    if is_video {
        args.push("-vn".to_string());
    }

    // Map streams: audio + any attached pictures (cover art)
    if !is_video {
        args.push("-map".to_string());
        args.push("0:a".to_string());
        args.push("-map".to_string());
        args.push("0:v?".to_string());
    }

    // Build audio filter chain
    let mut filters: Vec<String> = vec![];

    // Volume adjustment (10%-400%)
    if let Some(vol) = params.volume {
        if vol != 100 {
            let volume_factor = vol as f64 / 100.0;
            filters.push(format!("volume={:.2}", volume_factor));
        }
    }

    // Speed adjustment (0.25x-4.00x)
    // atempo filter range is [0.5, 2.0], chain multiple for values outside range
    if let Some(speed) = params.speed {
        if (speed - 1.0).abs() > 0.001 {
            let mut remaining = speed;
            while remaining > 2.0 {
                filters.push("atempo=2.0".to_string());
                remaining /= 2.0;
            }
            while remaining < 0.5 {
                filters.push("atempo=0.5".to_string());
                remaining /= 0.5;
            }
            filters.push(format!("atempo={:.4}", remaining));
        }
    }

    if !filters.is_empty() {
        args.push("-af".to_string());
        args.push(filters.join(","));
    }

    // Audio codec
    args.push("-c:a".to_string());
    args.push(format_config.codec.to_string());

    // Bitrate (for lossy formats)
    if let Some(bitrate) = params.bitrate {
        if !format_config.lossless {
            args.push("-b:a".to_string());
            args.push(format!("{}k", bitrate));
        }
    }

    // Sample rate
    if let Some(sr) = params.sample_rate {
        args.push("-ar".to_string());
        args.push(sr.to_string());
    }

    // Channels
    if let Some(ch) = params.channels {
        args.push("-ac".to_string());
        args.push(ch.to_string());
    }

    // Bit depth (for lossless formats)
    if format_config.supports_bit_depth {
        if let Some(bd) = params.bit_depth {
            match bd {
                16 => {
                    // Default for most formats, no extra arg needed
                }
                24 => {
                    args.push("-sample_fmt".to_string());
                    args.push("s32".to_string()); // Use s32 for 24-bit
                }
                32 => {
                    args.push("-sample_fmt".to_string());
                    args.push("s32".to_string());
                }
                _ => {}
            }
        }
    }

    // Preserve metadata (title, artist, album, cover art, etc.)
    // -map_metadata 0 copies all global metadata from input to output
    args.push("-map_metadata".to_string());
    args.push("0".to_string());

    // Copy cover art video stream as-is (for audio files with embedded artwork)
    if !is_video {
        args.push("-c:v".to_string());
        args.push("copy".to_string());
    }

    // Format-specific extra args
    for extra in &format_config.extra_args {
        args.push(extra.to_string());
    }

    // Progress output to stdout
    args.push("-progress".to_string());
    args.push("pipe:1".to_string());
    args.push("-nostats".to_string());

    // Output file
    args.push(output_path.to_string());

    args
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::converter::format_config;

    #[test]
    fn test_build_mp3_args() {
        let config = format_config::get_format_config("mp3");
        let params = ConvertParams {
            format: "mp3".to_string(),
            bitrate: Some(320),
            sample_rate: Some(48000),
            channels: Some(2),
            bit_depth: None,
            volume: Some(100),
            speed: Some(1.0),
        };
        let args = build_ffmpeg_args("input.wav", "output.mp3", &params, &config, false);

        assert!(args.contains(&"-c:a".to_string()));
        assert!(args.contains(&"libmp3lame".to_string()));
        assert!(args.contains(&"-b:a".to_string()));
        assert!(args.contains(&"320k".to_string()));
        assert!(args.contains(&"-ar".to_string()));
        assert!(args.contains(&"48000".to_string()));
        assert!(args.contains(&"-ac".to_string()));
        assert!(args.contains(&"2".to_string()));
    }

    #[test]
    fn test_volume_filter() {
        let config = format_config::get_format_config("mp3");
        let params = ConvertParams {
            format: "mp3".to_string(),
            bitrate: None,
            sample_rate: None,
            channels: None,
            bit_depth: None,
            volume: Some(200),
            speed: None,
        };
        let args = build_ffmpeg_args("input.wav", "output.mp3", &params, &config, false);

        let af_idx = args.iter().position(|a| a == "-af").unwrap();
        assert!(args[af_idx + 1].contains("volume=2"));
    }

    #[test]
    fn test_speed_filter_chain() {
        let config = format_config::get_format_config("mp3");
        let params = ConvertParams {
            format: "mp3".to_string(),
            bitrate: None,
            sample_rate: None,
            channels: None,
            bit_depth: None,
            volume: None,
            speed: Some(3.0),
        };
        let args = build_ffmpeg_args("input.wav", "output.mp3", &params, &config, false);

        let af_idx = args.iter().position(|a| a == "-af").unwrap();
        let filter = &args[af_idx + 1];
        assert!(filter.contains("atempo=2"));
        assert!(filter.contains("atempo=1.5"));
    }

    #[test]
    fn test_video_extraction() {
        let config = format_config::get_format_config("mp3");
        let params = ConvertParams {
            format: "mp3".to_string(),
            bitrate: Some(320),
            sample_rate: None,
            channels: None,
            bit_depth: None,
            volume: None,
            speed: None,
        };
        let args = build_ffmpeg_args("input.mp4", "output.mp3", &params, &config, true);

        assert!(args.contains(&"-vn".to_string()));
    }

    #[test]
    fn test_flac_lossless_no_bitrate() {
        let config = format_config::get_format_config("flac");
        let params = ConvertParams {
            format: "flac".to_string(),
            bitrate: Some(320), // Should be ignored for lossless
            sample_rate: Some(48000),
            channels: Some(2),
            bit_depth: None,
            volume: None,
            speed: None,
        };
        let args = build_ffmpeg_args("input.wav", "output.flac", &params, &config, false);

        assert!(!args.contains(&"-b:a".to_string()));
        assert!(args.contains(&"flac".to_string()));
    }

    #[test]
    fn test_progress_output() {
        let config = format_config::get_format_config("mp3");
        let params = ConvertParams {
            format: "mp3".to_string(),
            bitrate: None,
            sample_rate: None,
            channels: None,
            bit_depth: None,
            volume: None,
            speed: None,
        };
        let args = build_ffmpeg_args("input.wav", "output.mp3", &params, &config, false);

        assert!(args.contains(&"-progress".to_string()));
        assert!(args.contains(&"pipe:1".to_string()));
        assert!(args.contains(&"-nostats".to_string()));
    }
}
