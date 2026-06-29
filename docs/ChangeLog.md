# Change Log

All notable changes to AuraConvert will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic version tags.

## [v1.1.8] - 2026-06-29

### Added

- **Bundled FFmpeg**: Windows release now offers a variant with FFmpeg and FFprobe bundled (`-with-ffmpeg` suffix), auto-detected from the app's resource directory as the highest priority source
- **Dual Windows builds**: CI pipeline builds both standard (no FFmpeg) and bundled-FFmpeg Windows installers (NSIS + MSI) and portable binaries
- **MSI installer**: Windows release now also produces MSI installers alongside NSIS
- **CI auto-download FFmpeg**: Release workflow downloads FFmpeg essentials build from gyan.dev instead of storing binaries in the repository

### Changed

- **FFmpeg detection priority**: Bundled FFmpeg is now checked first, before user-configured path, system PATH, registry, and common install locations

## [v1.1.7] - 2026-06-13

### Added

- **README articles section**: Added "Articles / 文章" section with self-introduction links (WeChat, Zhihu, 52pojie) to both `README.md` and `README.zh-CN.md`

## [v1.1.6] - 2026-06-04

### Added

- **Toast notifications**: Summary toast showing total results (completed/failed count) and elapsed time per batch
- **File action buttons**: Delete file and open containing folder buttons after conversion
- **File size display**: Fetch real file size via `get_file_metadata` command instead of hardcoded 0
- **Rust open folder command**: New `open_folder` command using `explorer` to open the containing folder

### Changed

- **Version sync**: `tauri.conf.json` and TitleBar version unified to `v1.1.6`
- **Format reduction**: Removed unsupported formats (DTS/WMA/TTA) per FFmpeg 8.1.1 essentials build, from 16 down to **13**
- **Opus encoder**: Switched from `libopus` to native `opus` encoder + `-strict -2`
- **Toast position**: Moved from bottom-right to above the status bar

### Fixed

- **Drag-and-drop**: Use Tauri v2 native `onDragDropEvent` API instead of HTML5 drag events
- **Duplicate files on drag**: Added `useRef` re-entrancy guard to prevent race condition from duplicate drop events
- **Drag type error**: Fixed `DragDropEvent` union type `paths` property access
- **OGG/Vorbis encoder error**: Switched libvorbis to `-q:a` quality mode encoding to avoid `-b:a` + `-ar`/`-ac` parameter conflicts
- **Opus experimental feature**: Added `-strict -2` flag to enable native `opus` encoder
- **AC3/E-AC3/MP2 encoder errors**: Added to `simple_formats` list, skipping `-ar`/`-ac` forced parameters
- **Batch conversion**: Fixed second file failing in multi-file conversion (independent `FfmpegRunner` Clone cancellation flags)
- **File selection**: Added `select_folder` and `get_file_metadata` commands
- **Open folder button**: Fixed unresponsive `open_folder` button by using Rust native `explorer` command instead of `@tauri-apps/plugin-shell` `open`
- **Multi-language support**: Added language switcher (left of GitHub icon in toolbar), auto-detects system language, supports Chinese/English
- **README multi-language**: Added `README.md` (English) and `README.zh-CN.md` (Chinese) with mutual links
- **Language dropdown**: Fixed dropdown disappearing when moving cursor to menu items by adding `pt-1` bridge
- **Taskbar icon**: Regenerated `icon.ico` with proper multi-resolution sizes via `tauri icon` command
- **GitHub Actions**: Added `release.yml` workflow for automated multi-platform release builds (manual `workflow_dispatch` + auto on `release: published`)

## [v1.0.2] - 2026-06-03

### Fixed

- Audio info file size showing 0
- Audio info layout optimized to two-column display

## [v1.0.1] - 2026-06-03

### Fixed

- Rust compilation errors (lofty/base64 imports, AppHandle usage, std::fs::metadata replacement)
- File size showing 0 after file selection

## [v1.0.0] - 2026-06-02

### Added

- Initial release
- 13 output format audio conversion
- Batch conversion with real-time progress tracking
- Video file audio extraction
- Dark theme UI (Spotify style)
- Chinese/English i18n
- FFmpeg auto-detection and manual configuration
- Audio metadata reading (lofty + ffprobe)
- Smart parameter optimization

[Unreleased]: https://github.com/tabortao/AuraConvert/compare/v1.1.6...HEAD
[v1.1.6]: https://github.com/tabortao/AuraConvert/compare/v1.0.2...v1.1.6
[v1.0.2]: https://github.com/tabortao/AuraConvert/compare/v1.0.1...v1.0.2
[v1.0.1]: https://github.com/tabortao/AuraConvert/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/tabortao/AuraConvert/releases/tag/v1.0.0