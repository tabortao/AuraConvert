use tauri_plugin_dialog::DialogExt;

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