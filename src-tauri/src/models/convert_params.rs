use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(dead_code)]
pub struct ConvertParams {
    pub format: String,
    pub bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
    pub bit_depth: Option<u32>,
    pub volume: Option<u32>,
    pub speed: Option<f64>,
    pub output_dir: Option<String>,
    pub filename_template: Option<String>,
}

impl Default for ConvertParams {
    fn default() -> Self {
        Self {
            format: "mp3".to_string(),
            bitrate: Some(320),
            sample_rate: Some(48000),
            channels: Some(2),
            bit_depth: None,
            volume: Some(100),
            speed: Some(1.0),
            output_dir: None,
            filename_template: Some("original".to_string()),
        }
    }
}
