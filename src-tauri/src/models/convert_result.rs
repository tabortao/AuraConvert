use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(dead_code)]
pub struct ConvertResult {
    pub file_id: String,
    pub success: bool,
    pub output_path: Option<String>,
    pub output_size: Option<u64>,
    pub compression_ratio: Option<f64>,
    pub error: Option<String>,
    pub duration_ms: u64,
}
