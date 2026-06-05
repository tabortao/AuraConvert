use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::mpsc;
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
    let (tx, rx) = mpsc::channel();
    
    app
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
        .pick_files(move |result| {
            let _ = tx.send(result);
        });

    let selected = rx.recv().map_err(|e| format!("Failed to receive: {}", e))?;
    
    match selected {
        Some(paths) => Ok(paths.into_iter().map(|p| p.to_string()).collect()),
        None => Ok(vec![]),
    }
}

#[tauri::command]
pub async fn select_folder(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let (tx, rx) = mpsc::channel();
    
    app
        .dialog()
        .file()
        .set_title("选择包含音频/视频的文件夹")
        .pick_folder(move |result| {
            let _ = tx.send(result);
        });

    let selected = rx.recv().map_err(|e| format!("Failed to receive: {}", e))?;

    if let Some(dir_path) = selected {
        let dir = PathBuf::from(dir_path.to_string());
        let mut files: Vec<String> = Vec::new();
        
        if let Ok(entries) = std::fs::read_dir(dir) {
            let supported_extensions = [
                "mp3", "aac", "flac", "wav", "m4a", "ogg", "opus", "alac", "wma",
                "ac3", "aiff", "eac3", "dts", "mp2", "wv", "tta", "ape",
                "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm",
            ];
            
            for entry in entries.flatten() {
                if let Some(ext) = entry.path().extension() {
                    if let Some(ext_str) = ext.to_str() {
                        if supported_extensions.contains(&ext_str.to_lowercase().as_str()) {
                            if let Some(path_str) = entry.path().to_str() {
                                files.push(path_str.to_string());
                            }
                        }
                    }
                }
            }
        }
        
        Ok(files)
    } else {
        Ok(vec![])
    }
}

#[tauri::command]
pub async fn select_output_dir(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = mpsc::channel();
    
    app
        .dialog()
        .file()
        .set_title("选择输出目录")
        .pick_folder(move |result| {
            let _ = tx.send(result);
        });

    let selected = rx.recv().map_err(|e| format!("Failed to receive: {}", e))?;
    
    Ok(selected.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn select_ffmpeg_exe(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = mpsc::channel();
    
    app
        .dialog()
        .file()
        .set_title("选择 FFmpeg 可执行文件")
        .add_filter("Executable", &["exe"])
        .pick_file(move |result| {
            let _ = tx.send(result);
        });

    let selected = rx.recv().map_err(|e| format!("Failed to receive: {}", e))?;
    
    Ok(selected.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    let folder_path = Path::new(&path);
    let parent = if folder_path.is_dir() {
        folder_path.to_path_buf()
    } else {
        folder_path.parent().map(|p| p.to_path_buf()).unwrap_or_default()
    };
    
    if !parent.as_os_str().is_empty() {
        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("explorer")
                .arg(parent.to_str().unwrap_or(""))
                .spawn()
                .map_err(|e| format!("Failed to open folder: {}", e))?;
        }
        #[cfg(not(target_os = "windows"))]
        {
            std::process::Command::new("open")
                .arg(parent.to_str().unwrap_or(""))
                .spawn()
                .map_err(|e| format!("Failed to open folder: {}", e))?;
        }
    }
    
    Ok(())
}