use std::path::PathBuf;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

pub struct FfmpegDetector {
    app: AppHandle,
}

impl FfmpegDetector {
    pub fn new(app: &AppHandle) -> Self {
        Self { app: app.clone() }
    }

    /// Detect FFmpeg with priority chain:
    /// 1. User configured path (from store)
    /// 2. System PATH (where/which command)
    /// 3. Windows registry
    /// 4. Common install locations
    pub async fn detect(&self) -> Option<PathBuf> {
        // 1. Check user configured path
        if let Some(path) = self.check_user_config() {
            return Some(path);
        }

        // 2. Check system PATH
        if let Some(path) = self.check_path().await {
            return Some(path);
        }

        // 3. Check Windows registry
        #[cfg(target_os = "windows")]
        if let Some(path) = self.check_registry() {
            return Some(path);
        }

        // 4. Check common install locations
        if let Some(path) = self.check_common_paths() {
            return Some(path);
        }

        None
    }

    async fn check_path(&self) -> Option<PathBuf> {
        let cmd = if cfg!(target_os = "windows") {
            "where"
        } else {
            "which"
        };

        let output = tokio::process::Command::new(cmd)
            .arg("ffmpeg")
            .output()
            .await
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let first_line = stdout.lines().next()?.trim();
        let path = PathBuf::from(first_line);

        if path.exists() {
            Some(path)
        } else {
            None
        }
    }

    #[cfg(target_os = "windows")]
    fn check_registry(&self) -> Option<PathBuf> {
        use winreg::enums::*;
        use winreg::RegKey;

        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        let hku = RegKey::predef(HKEY_CURRENT_USER);

        // Try multiple registry paths
        let reg_paths = [
            (hklm.open_subkey(r"SOFTWARE\FFmpeg").ok(), "InstallPath"),
            (hku.open_subkey(r"SOFTWARE\FFmpeg").ok(), "InstallPath"),
            (hklm.open_subkey(r"SOFTWARE\Gyan\FFmpeg").ok(), "InstallPath"),
        ];

        for (key_opt, value_name) in reg_paths {
            if let Some(key) = key_opt {
                if let Ok(install_path) = key.get_value::<String, _>(value_name) {
                    let exe_path = PathBuf::from(&install_path).join("bin").join("ffmpeg.exe");
                    if exe_path.exists() {
                        return Some(exe_path);
                    }
                }
            }
        }

        None
    }

    #[cfg(not(target_os = "windows"))]
    fn check_registry(&self) -> Option<PathBuf> {
        None
    }

    fn check_common_paths(&self) -> Option<PathBuf> {
        let common_paths: Vec<String> = if cfg!(target_os = "windows") {
            let localappdata = std::env::var("LOCALAPPDATA").unwrap_or_default();
            let userprofile = std::env::var("USERPROFILE").unwrap_or_default();
            vec![
                r"C:\ffmpeg\bin\ffmpeg.exe".to_string(),
                r"C:\Program Files\FFmpeg\bin\ffmpeg.exe".to_string(),
                r"C:\Program Files (x86)\FFmpeg\bin\ffmpeg.exe".to_string(),
                format!(r"{}\Programs\FFmpeg\bin\ffmpeg.exe", localappdata),
                format!(r"{}\ffmpeg\bin\ffmpeg.exe", userprofile),
                format!(r"{}\scoop\apps\ffmpeg\current\bin\ffmpeg.exe", userprofile),
            ]
        } else {
            let home = std::env::var("HOME").unwrap_or_default();
            vec![
                "/usr/local/bin/ffmpeg".to_string(),
                "/usr/bin/ffmpeg".to_string(),
                "/opt/homebrew/bin/ffmpeg".to_string(),
                format!("{}/ffmpeg", home),
            ]
        };

        for path_str in common_paths {
            let path = PathBuf::from(path_str);
            if path.exists() {
                return Some(path);
            }
        }

        None
    }

    fn check_user_config(&self) -> Option<PathBuf> {
        let store = self.app.store("settings.json").ok()?;
        let path_value = store.get("ffmpeg_path")?;
        let path_str = path_value.as_str()?;
        if path_str.is_empty() {
            return None;
        }
        let path = PathBuf::from(path_str);
        if path.exists() {
            Some(path)
        } else {
            None
        }
    }

    pub async fn check_version(&self, path: &PathBuf) -> Result<String, String> {
        let output = tokio::process::Command::new(path)
            .args(["-version"])
            .output()
            .await
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            Ok(stdout.lines().next().unwrap_or("").to_string())
        } else {
            Err("Failed to check FFmpeg version".to_string())
        }
    }
}