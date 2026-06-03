#[derive(Debug, Default, Clone)]
#[allow(dead_code)]
pub struct ProgressInfo {
    pub frame: Option<u64>,
    pub fps: Option<f64>,
    pub total_size: Option<u64>,
    pub out_time_us: Option<u64>,
    pub speed: Option<f64>,
    pub is_complete: bool,
}

/// Parse a single line from FFmpeg -progress pipe:1 output
/// Format: key=value
pub fn parse_progress_line(line: &str) -> Option<ProgressInfo> {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return None;
    }

    let (key, value) = trimmed.split_once('=')?;
    let key = key.trim();
    let value = value.trim();

    match key {
        "frame" => Some(ProgressInfo {
            frame: value.parse().ok(),
            ..Default::default()
        }),
        "fps" => Some(ProgressInfo {
            fps: value.parse().ok(),
            ..Default::default()
        }),
        "total_size" => Some(ProgressInfo {
            total_size: value.parse().ok(),
            ..Default::default()
        }),
        "out_time_us" => Some(ProgressInfo {
            out_time_us: value.parse().ok(),
            ..Default::default()
        }),
        "speed" => {
            // Format: "5.68x"
            let num_str = value.trim_end_matches('x');
            Some(ProgressInfo {
                speed: num_str.parse().ok(),
                ..Default::default()
            })
        }
        "progress" => {
            if value == "end" {
                Some(ProgressInfo {
                    is_complete: true,
                    ..Default::default()
                })
            } else {
                None
            }
        }
        _ => None,
    }
}

/// Calculate progress percentage from out_time_us and total duration
pub fn calculate_progress(out_time_us: u64, total_duration_us: u64) -> f64 {
    if total_duration_us == 0 {
        return 0.0;
    }
    (out_time_us as f64 / total_duration_us as f64 * 100.0).min(100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_progress_time() {
        let line = "out_time_us=10300000";
        let info = parse_progress_line(line).unwrap();
        assert_eq!(info.out_time_us, Some(10300000));
    }

    #[test]
    fn test_parse_progress_speed() {
        let line = "speed=5.68x";
        let info = parse_progress_line(line).unwrap();
        assert!((info.speed.unwrap() - 5.68).abs() < 0.01);
    }

    #[test]
    fn test_parse_progress_end() {
        let line = "progress=end";
        let info = parse_progress_line(line).unwrap();
        assert!(info.is_complete);
    }

    #[test]
    fn test_parse_progress_frame() {
        let line = "frame=100";
        let info = parse_progress_line(line).unwrap();
        assert_eq!(info.frame, Some(100));
    }

    #[test]
    fn test_calculate_progress() {
        assert_eq!(calculate_progress(5_000_000, 10_000_000), 50.0);
        assert_eq!(calculate_progress(10_000_000, 10_000_000), 100.0);
        assert_eq!(calculate_progress(0, 10_000_000), 0.0);
        assert_eq!(calculate_progress(0, 0), 0.0);
    }
}
