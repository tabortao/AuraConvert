use std::path::PathBuf;

/// Build output file path from input path and settings
pub fn build_output_path(
    input_path: &str,
    output_extension: &str,
    output_dir: Option<&str>,
    filename_template: &str,
) -> Result<String, String> {
    let input = PathBuf::from(input_path);
    let stem = input
        .file_stem()
        .ok_or("Invalid input filename")?
        .to_string_lossy()
        .to_string();

    let output_name = match filename_template {
        "suffix" => format!("{}_converted", stem),
        _ => stem,
    };

    let output_filename = format!("{}.{}", output_name, output_extension);

    let dir = match output_dir {
        Some(d) if !d.is_empty() => PathBuf::from(d),
        _ => input
            .parent()
            .ok_or("Cannot determine parent directory")?
            .to_path_buf(),
    };

    let output_path = dir.join(&output_filename);
    Ok(output_path.to_string_lossy().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_output_path_same_dir() {
        let result = build_output_path(
            r"C:\Music\song.flac",
            "mp3",
            None,
            "original",
        ).unwrap();
        assert_eq!(result, r"C:\Music\song.mp3");
    }

    #[test]
    fn test_build_output_path_custom_dir() {
        let result = build_output_path(
            r"C:\Music\song.flac",
            "mp3",
            Some(r"C:\Output"),
            "original",
        ).unwrap();
        assert_eq!(result, r"C:\Output\song.mp3");
    }

    #[test]
    fn test_build_output_path_suffix() {
        let result = build_output_path(
            r"C:\Music\song.flac",
            "mp3",
            None,
            "suffix",
        ).unwrap();
        assert_eq!(result, r"C:\Music\song_converted.mp3");
    }
}
