use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::FsExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileMetadata {
    pub size: u64,
}

#[tauri::command]
pub async fn get_file_metadata(app: tauri::AppHandle, path: String) -> Result<FileMetadata, String> {
    let mut opts = tauri_plugin_fs::OpenOptions::new();
    opts.read(true);
    let file = app
        .fs()
        .open(
            tauri_plugin_fs::FilePath::from(Path::new(&path)),
            opts,
        )
        .map_err(|e| format!("Failed to open file: {}", e))?;

    let metadata = file.metadata().map_err(|e| format!("Failed to read metadata: {}", e))?;

    Ok(FileMetadata {
        size: metadata.len(),
    })
}

#[tauri::command]
pub async fn select_files(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let selected = app
        .dialog()
        .file()
        .set_title("选择音频/视频文件")
        .add_filter(
            "Audio & Video",
            &[
                "mp3", "aac", "flac", "wav", "m4a", "ogg", "opus", "alac", "wma",
                "ac3", "aiff", "eac3", "dts", "mp2", "wv", "tta", "ape",
                "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm",
            ],
        )
        .blocking_pick_files();

    match selected {
        Some(paths) => Ok(paths.into_iter().map(|p| p.to_string()).collect()),
        None => Ok(vec![]),
    }
}

#[tauri::command]
pub async fn select_output_dir(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let selected = app
        .dialog()
        .file()
        .set_title("选择输出目录")
        .blocking_pick_folder();

    Ok(selected.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn select_ffmpeg_exe(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let selected = app
        .dialog()
        .file()
        .set_title("选择 FFmpeg 可执行文件")
        .add_filter("Executable", &["exe"])
        .blocking_pick_file();

    Ok(selected.map(|p| p.to_string()))
}