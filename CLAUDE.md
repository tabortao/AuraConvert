# AuraConvert - 音擎

> A Lightweight & Professional Audio Converter Powered by Rust & Tauri

## Project Overview

AuraConvert is a cross-platform desktop audio converter built with Tauri v2, Rust, and React. Supports 13 output formats, batch conversion, real-time progress tracking, and audio extraction from video files.

## Rules

- **版本号管理**: 同一天的所有更新合并到同一个版本号中记录，避免版本号过多。如需追加内容，更新已有版本的 entry。
- **包管理**: 使用 pnpm，不使用 npm。
- **变更记录**: 每次任务完成后，在 `docs/ChangeLog.md` 中更新，格式遵循 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)。
- **构建**: 从 `src-tauri` 子目录使用 `cargo build --release`，完整打包使用 `pnpm tauri build`。
- **FFmpeg**: 使用 FFmpeg 8.1.1 essentials build，不支持 DTS/WMA/TTA/aptX/SBC/TrueHD/MLP/DFPWM 编码器。
- **常见错误**: 常见错误、多次提问最终解决的错误，需要写入 `docs/COMMON_ERRORS.md` 中，避免重复错误再犯。

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Desktop Framework | Tauri | v2 |
| Backend | Rust | 2024 Edition |
| Frontend | React | v19 |
| Type System | TypeScript | ~5.7 |
| Build Tool | Vite | v6 |
| CSS | Tailwind CSS | v4 |
| UI | Radix UI + shadcn/ui (New York) |
| State | Zustand | v5 |
| i18n | react-i18next | v15 |
| Audio Metadata | lofty | v0.21 |
| Async Runtime | tokio | v1 (full) |

## Development Commands

```bash
pnpm install          # Install frontend dependencies
pnpm tauri dev        # Start dev server (frontend + backend)
pnpm tauri build      # Build for production
cd src-tauri && cargo test  # Run Rust tests
```

## Architecture

```
React Frontend              Rust Backend (Tauri v2)
┌──────────┐   invoke       ┌──────────────────────┐
│ Zustand  │ ─────────────> │ Commands (8 APIs)    │
│ Stores   │   listen       │ → Converter          │
│ Hooks    │ <───────────── │ → FFmpeg Runner      │
└──────────┘   events       └──────────┬───────────┘
                                       ▼
                                ┌──────────────┐
                                │   FFmpeg CLI   │
                                └──────────────┘
```

### Tauri Commands

| Command | Parameters | Return | Description |
|---------|------------|--------|-------------|
| `detect_ffmpeg` | — | `FfmpegStatus` | Auto-detect FFmpeg path and version |
| `start_conversion` | `files, params` | `String` | Start batch conversion |
| `cancel_conversion` | — | `()` | Cancel current conversion |
| `read_audio_info` | `file_path: String` | `AudioInfo` | Read audio metadata |
| `select_files` | — | `Vec<String>` | Open file picker dialog |
| `select_output_dir` | — | `Option<String>` | Open directory picker dialog |
| `get_file_metadata` | `path: String` | `{size: u64}` | Get file size |

### Tauri Events

| Event | Data | Description |
|-------|------|-------------|
| `conversion-progress` | `{fileId, progress, speed}` | Single file conversion progress |
| `file-completed` | `{fileId, outputPath, outputSize, compressionRatio}` | File conversion completed |
| `file-failed` | `{fileId, status, error}` | File conversion failed |
| `total-progress` | `{completed, total, percentage, eta}` | Overall progress update |

## Supported Formats (13 Output Formats)

### Lossy
| Format | Codec | Max Bitrate | Notes |
|--------|-------|-------------|-------|
| MP3 | `libmp3lame` | 320kbps | |
| AAC | `aac` | 512kbps | |
| M4A | `aac` | 512kbps | needs `-f ipod` |
| OGG | `libvorbis` | 500kbps | uses `-q:a` quality mode |
| Opus | `opus` | 510kbps | needs `-strict -2` |
| AC3 | `ac3` | 640kbps | simple format (no `-ar`/`-ac`) |
| E-AC3 | `eac3` | 1024kbps | simple format |
| MP2 | `mp2` | 384kbps | simple format |

### Lossless
| Format | Codec | Supports Bit Depth |
|--------|-------|--------------------|
| FLAC | `flac` | Yes |
| WAV | `pcm_s16le` | Yes |
| ALAC | `alac` | No |
| AIFF | `pcm_s16be` | No |
| WavPack | `wavpack` | No |

## Code Style

### Frontend (TypeScript/React)
- Functional components with hooks, Zustand for state, Tailwind CSS for styling
- `cn()` utility for conditional classes, `useTranslation` for i18n
- PascalCase for components, camelCase for utilities

### Backend (Rust)
- 2024 Edition, Serde, Tokio, `#[tauri::command]` attribute
- `Result<T, String>` for error handling, `log` + `env_logger` for logging
- snake_case for functions/variables, PascalCase for types/structs

## Design

- **Primary Color**: `#1db954` (Spotify Green)
- **Background**: `#0a0a0a` (Deep Black)
- **UI Style**: Spotify-style dark theme, shadcn/ui (New York)
- **Icons**: Lucide React

## Docs Index

| Document | Description |
|----------|-------------|
| [docs/ChangeLog.md](docs/ChangeLog.md) | 变更日志 |
| [docs/COMMON_ERRORS.md](docs/COMMON_ERRORS.md) | 常见错误与经验总结 |
