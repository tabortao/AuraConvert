use super::format_config::get_format_config;

#[allow(dead_code)]
pub struct SmartOptimizeResult {
    pub recommended_bitrate: Option<u32>,
    pub recommended_sample_rate: u32,
    pub recommended_channels: u32,
    pub should_use_lossless: bool,
}

/// Smart optimization: auto-calculate best output parameters based on source
#[allow(dead_code)]
pub fn optimize_params(
    source_bitrate: u32,       // bps
    source_sample_rate: u32,   // Hz
    source_channels: u32,
    _source_bit_depth: Option<u32>,
    target_format: &str,
) -> SmartOptimizeResult {
    let format_config = get_format_config(target_format);

    if format_config.lossless {
        // Lossless format: preserve source parameters
        return SmartOptimizeResult {
            recommended_bitrate: None,
            recommended_sample_rate: source_sample_rate.min(
                format_config.max_sample_rate.unwrap_or(u32::MAX),
            ),
            recommended_channels: source_channels,
            should_use_lossless: true,
        };
    }

    // Lossy format: smart bitrate calculation
    let source_kbps = source_bitrate / 1000;
    let max_kbps = format_config.max_bitrate.unwrap_or(320);

    // Use source bitrate if lower than max, otherwise use max
    let recommended_bitrate = if source_kbps > 0 {
        Some(source_kbps.min(max_kbps))
    } else {
        format_config.default_bitrate
    };

    SmartOptimizeResult {
        recommended_bitrate,
        recommended_sample_rate: source_sample_rate.min(
            format_config.max_sample_rate.unwrap_or(48000),
        ),
        // Lossy formats: max stereo
        recommended_channels: source_channels.min(2),
        should_use_lossless: false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lossless_preserves_params() {
        let result = optimize_params(1411200, 96000, 2, Some(24), "flac");
        assert!(result.should_use_lossless);
        assert!(result.recommended_bitrate.is_none());
        assert_eq!(result.recommended_sample_rate, 96000);
        assert_eq!(result.recommended_channels, 2);
    }

    #[test]
    fn test_lossy_limits_bitrate() {
        let result = optimize_params(320000, 48000, 2, Some(16), "mp3");
        assert!(!result.should_use_lossless);
        assert_eq!(result.recommended_bitrate, Some(320));
    }

    #[test]
    fn test_lossy_high_source_bitrate() {
        // Source 1411kbps (CD quality) to MP3 (max 320kbps)
        let result = optimize_params(1411000, 44100, 2, Some(16), "mp3");
        assert_eq!(result.recommended_bitrate, Some(320));
    }

    #[test]
    fn test_lossy_low_source_bitrate() {
        // Source 128kbps to MP3
        let result = optimize_params(128000, 44100, 2, None, "mp3");
        assert_eq!(result.recommended_bitrate, Some(128));
    }

    #[test]
    fn test_lossy_limits_channels() {
        let result = optimize_params(1411000, 48000, 6, Some(24), "aac");
        assert_eq!(result.recommended_channels, 2);
    }
}
