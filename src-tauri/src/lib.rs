use tauri_plugin_store::StoreExt;

mod commands;
mod converter;
mod ffmpeg;
mod models;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(commands::convert::ConversionState {
            runners: std::sync::Mutex::new(std::collections::HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            commands::ffmpeg::detect_ffmpeg,
            commands::ffmpeg::check_ffmpeg_version,
            commands::convert::start_conversion,
            commands::convert::cancel_conversion,
            commands::audio_info::read_audio_info,
            commands::file_ops::select_files,
            commands::file_ops::select_output_dir,
            commands::file_ops::select_ffmpeg_exe,
        ])
        .setup(|app| {
            // Initialize default settings
            if let Ok(store) = app.store("settings.json") {
                if store.get("ffmpeg_path").is_none() {
                    let _ = store.set("ffmpeg_path", "");
                }
                if store.get("default_format").is_none() {
                    let _ = store.set("default_format", "mp3");
                }
                if store.get("bitrate").is_none() {
                    let _ = store.set("bitrate", 320);
                }
                if store.get("sample_rate").is_none() {
                    let _ = store.set("sample_rate", 48000);
                }
                if store.get("channels").is_none() {
                    let _ = store.set("channels", 2);
                }
                if store.get("output_dir_mode").is_none() {
                    let _ = store.set("output_dir_mode", "same");
                }
                if store.get("language").is_none() {
                    let _ = store.set("language", "zh");
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}