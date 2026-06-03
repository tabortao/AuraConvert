use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(dead_code)]
pub struct AudioFile {
    pub id: String,
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub duration: Option<f64>,
    pub bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
    pub bit_depth: Option<u32>,
    pub format: Option<String>,
    pub is_video: bool,
    pub cover_art: Option<String>,
    pub status: String,
    pub progress: f64,
    pub error: Option<String>,
    pub output_path: Option<String>,
    pub output_size: Option<u64>,
    pub compression_ratio: Option<f64>,
}
