# AuraConvert - 音擎

> A Lightweight & Professional Audio Converter Powered by Rust & Tauri

## Project Overview

AuraConvert is a cross-platform desktop audio converter built with Tauri v2, Rust, and React. It supports 21 output formats, batch conversion, real-time progress tracking, and audio extraction from video files.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Desktop Framework | Tauri | v2 |
| Backend Language | Rust | 2024 Edition |
| Frontend Framework | React | v19 |
| Type System | TypeScript | ~5.7 |
| Build Tool | Vite | v6 |
| CSS Framework | Tailwind CSS | v4 |
| UI Components | Radix UI + shadcn/ui (New York) |
| State Management | Zustand | v5 |
| i18n | react-i18next | v15 |
| Audio Metadata | lofty | v0.21 |
| Async Runtime | tokio | v1 (full) |

## Project Structure

```
AuraConvert/
├── src/                          # Frontend source (React + TypeScript)
│   ├── components/               # React components
│   │   ├── Layout.tsx            # Main layout (Header + Sidebar + Content)
│   │   ├── DropZone.tsx          # Drag & drop upload zone
│   │   ├── FileList.tsx           # File list + total progress bar
│   │   ├── FileItem.tsx          # Single file row (status/progress/compression ratio)
│   │   ├── SettingsPanel.tsx      # Settings panel (FFmpeg/format/params/output)
│   │   ├── FormatSelector.tsx     # Output format selector (21 formats)
│   │   ├── ParamPanel.tsx         # Parameter adjustment panel
│   │   ├── ProgressBar.tsx        # Progress bar component
│   │   ├── ConvertButton.tsx      # Start/Clear/Cancel buttons
│   │   ├── AudioInfoDialog.tsx    # Audio info dialog (cover + metadata)
│   │   └── ThemeToggle.tsx        # Dark/Light theme toggle
│   ├── hooks/                    # Custom React hooks
│   │   ├── useFFmpeg.ts           # FFmpeg detection + path management
│   │   ├── useConversion.ts       # Conversion flow control + event listeners
│   │   ├── useAudioInfo.ts        # Audio info reading
│   │   └── useKeyboardShortcuts.ts # Keyboard shortcuts
│   ├── stores/                   # Zustand state management
│   │   ├── conversionStore.ts     # Conversion state (file list/progress/params)
│   │   └── settingsStore.ts      # Settings persistence (tauri-plugin-store)
│   ├── i18n/                     # Internationalization
│   │   ├── index.ts               # i18next configuration
│   │   ├── zh.json                # Chinese translations
│   │   └── en.json                # English translations
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts               # AudioFile, ConvertParams, etc.
│   ├── utils/                    # Utility functions
│   │   ├── ffmpegArgs.ts          # FFmpeg argument utilities
│   │   ├── fileUtils.ts           # File utilities
│   │   └── formatUtils.ts         # Format utilities
│   ├── styles/                   # Global styles
│   │   └── globals.css            # Tailwind CSS imports + custom styles
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands/             # Tauri commands (IPC calls)
│   │   │   ├── mod.rs             # Command module exports
│   │   │   ├── ffmpeg.rs          # detect_ffmpeg / check_ffmpeg_version
│   │   │   ├── convert.rs         # start_conversion / cancel_conversion
│   │   │   ├── audio_info.rs       # read_audio_info (lofty + ffprobe)
│   │   │   └── file_ops.rs        # select_files / select_output_dir
│   │   ├── converter/            # Conversion logic
│   │   │   ├── mod.rs
│   │   │   ├── format_config.rs   # 21 format configs (codec/extension/params)
│   │   │   ├── args_builder.rs    # FFmpeg command-line argument builder
│   │   │   └── smart_optimize.rs  # Smart parameter optimization
│   │   ├── ffmpeg/               # FFmpeg integration
│   │   │   ├── mod.rs
│   │   │   ├── detector.rs        # FFmpeg auto-detection (PATH/registry/common paths)
│   │   │   ├── runner.rs          # FFmpeg process management (async/progress/cancel)
│   │   │   └── parser.rs          # -progress output parser
│   │   ├── models/               # Data models
│   │   │   ├── mod.rs
│   │   │   ├── audio_file.rs      # AudioFile struct
│   │   │   ├── convert_params.rs  # ConvertParams struct
│   │   │   └── convert_result.rs  # ConvertResult struct
│   │   ├── utils/                # Utilities
│   │   │   ├── mod.rs
│   │   │   └── path_utils.rs      # Output path construction
│   │   ├── lib.rs                # Tauri entry (plugin registration/command registration/setup)
│   │   └── main.rs               # Windows subsystem entry
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   ├── capabilities/default.json  # Permission configuration
│   └── icons/                    # Application icons
│
├── package.json                  # Node.js dependencies
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── index.html                    # HTML entry point
```

## Development Commands

### Prerequisites

- Rust >= 1.70
- Node.js >= 18
- pnpm >= 8
- FFmpeg >= 5.0
- Windows: MSVC Build Tools (C++ desktop development)

### Setup

```bash
# Clone repository
git clone <repo-url>
cd AuraConvert

# Install frontend dependencies
pnpm install
```

### Development

```bash
# Start development server (frontend HMR + Rust backend)
pnpm tauri dev
```

The app will be available at `http://localhost:1420`

### Build

```bash
# Build for production (frontend + backend → installer)
pnpm tauri build
```

Output artifacts are in `src-tauri/target/release/bundle/`

### Testing

```bash
# Run Rust tests
cd src-tauri
cargo test
```

## Architecture

### Frontend-Backend Communication

```
React Frontend                Rust Backend (Tauri v2)
┌─────────────┐              ┌──────────────────────┐
│  Components │              │   Commands (8 APIs)  │
│  ↓          │   invoke     │   ↓                  │
│  Zustand    │ ──────────> │   Converter          │
│  Stores     │              │   (args_builder)     │
│  ↓          │   listen     │   ↓                  │
│  Hooks      │ <────────── │   FFmpeg Runner      │
│             │   events     │   (process mgmt)     │
└─────────────┘              └──────────────────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │   FFmpeg CLI  │
                               │  (external)   │
                               └──────────────┘
```

### Tauri Commands (IPC)

| Command | Parameters | Return | Description |
|---------|------------|--------|-------------|
| `detect_ffmpeg` | — | `FfmpegStatus` | Auto-detect FFmpeg path and version |
| `check_ffmpeg_version` | `path: String` | `String` | Check FFmpeg version at path |
| `start_conversion` | `files, params` | `String` | Start batch conversion |
| `cancel_conversion` | — | `()` | Cancel current conversion |
| `read_audio_info` | `file_path: String` | `AudioInfo` | Read audio metadata |
| `select_files` | — | `Vec<String>` | Open file picker dialog |
| `select_output_dir` | — | `Option<String>` | Open directory picker dialog |
| `select_ffmpeg_exe` | — | `Option<String>` | Open FFmpeg executable picker |

### Tauri Events (Backend → Frontend)

| Event | Data | Description |
|-------|------|-------------|
| `conversion-progress` | `{fileId, progress, speed}` | Single file conversion progress |
| `file-status-changed` | `{fileId, status}` | File status change (converting/cancelled) |
| `file-completed` | `{fileId, outputPath, outputSize, compressionRatio}` | File conversion completed |
| `file-failed` | `{fileId, status, error}` | File conversion failed |
| `total-progress` | `{completed, total, percentage, eta}` | Overall progress update |

## Supported Formats (21 Output Formats)

### Lossy Formats
- **MP3** - codec: `libmp3lame`, max bitrate: 320kbps
- **AAC** - codec: `aac`, max bitrate: 512kbps
- **M4A** - codec: `aac`, max bitrate: 512kbps
- **OGG** - codec: `libvorbis`, max bitrate: 500kbps
- **Opus** - codec: `libopus`
- **WMA** - codec: `wmav2`
- **AC3** - codec: `ac3`
- **E-AC3** - codec: `eac3`
- **DTS** - codec: `dca`
- **MP2** - codec: `mp2`

### Lossless Formats
- **FLAC** - codec: `flac`, supports bit depth
- **WAV** - codec: `pcm_s16le`, supports bit depth
- **ALAC** - codec: `alac`
- **AIFF** - codec: `pcm_s16be`
- **WavPack** - codec: `wavpack`
- **TTA** - codec: `tta`
- **aptX** - codec: `aptx`
- **SBC** - codec: `sbc`
- **TrueHD** - codec: `truehd`
- **MLP** - codec: `mlp`
- **DFPWM** - codec: `dfpwm`

## Key Features

### Conversion Parameters
- **Bitrate**: Adjustable output bitrate (lossy formats)
- **Sample Rate**: 44100/48000/96000/192000 Hz
- **Channels**: Mono/Stereo
- **Bit Depth**: 16/24/32 bit (lossless formats)
- **Volume**: 10%-400% volume scaling
- **Speed**: 0.25x-4.00x playback speed transformation

### Smart Optimization (`smart_optimize.rs`)
- Preserves lossless quality when converting between lossless formats
- Limits bitrate for lossy formats to prevent quality degradation
- Adjusts channels automatically based on source

### FFmpeg Integration
- **Auto-detection chain**: User config → System PATH → Windows Registry → Common install paths
- **Manual configuration**: User can specify FFmpeg path
- **Real-time progress**: Parses `-progress pipe:1` output for accurate progress
- **Process management**: Async execution with cancellation support

### UI Features
- **Dark theme**: Spotify-style dark UI (`#0a0a0a` background + `#1db954` accent)
- **Drag & drop**: Support for dragging multiple files/folders
- **Real-time progress**: Per-file progress + total progress + ETA
- **Compression ratio**: Displayed after conversion
- **Audio metadata**: View title, artist, album, cover art
- **Keyboard shortcuts**: `Ctrl+Enter` start conversion, `Delete` clear list
- **i18n**: Chinese/English language switching

## Configuration

### Tauri Config (`tauri.conf.json`)
- Window: 1100×720 (min 900×600)
- Identifier: `com.auraconvert`
- Bundle target: NSIS (Windows installer)

### Default Settings (via tauri-plugin-store)
```json
{
  "ffmpeg_path": "",
  "default_format": "mp3",
  "bitrate": 320,
  "sample_rate": 48000,
  "channels": 2,
  "output_dir_mode": "same",
  "language": "zh"
}
```

## Code Style & Conventions

### Frontend (TypeScript/React)
- Use functional components with hooks
- Zustand for state management (not Redux)
- Tailwind CSS for styling with `cn()` utility for conditional classes
- Radix UI primitives for accessible components
- i18next for internationalization (`useTranslation` hook)
- File naming: PascalCase for components, camelCase for utilities

### Backend (Rust)
- 2024 Edition
- Serde for serialization (`#[derive(Serialize, Deserialize)]`)
- Tokio for async runtime
- Tauri commands use `#[tauri::command]` attribute
- Error handling with `Result<T, String>`
- Logging with `log` + `env_logger` crates

### Naming Conventions
- Rust: `snake_case` for functions/variables, `PascalCase` for types/structs
- TypeScript: `camelCase` for functions/variables, `PascalCase` for components/types
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities

## Testing

### Rust Tests
Located in `src-tauri/src/` with `#[cfg(test)]` modules:
- `format_config` - 21 format configuration completeness verification
- `args_builder` - FFmpeg argument construction (MP3/volume/speed/video extraction/lossless/progress output)
- `smart_optimize` - Smart parameter optimization (lossless preservation/lossy limits/channel limits)
- `parser` - Progress line parsing + progress percentage calculation
- `path_utils` - Output path construction (same dir/custom dir/suffix mode)

## Dependencies

### Key Frontend Dependencies
- `@tauri-apps/api` - Tauri IPC communication
- `@tauri-apps/plugin-dialog` - Native file/dialog APIs
- `@tauri-apps/plugin-fs` - File system access
- `@tauri-apps/plugin-store` - Local storage persistence
- `zustand` - Lightweight state management
- `react-dropzone` - File drag & drop
- `react-i18next` - Internationalization
- `clsx` + `tailwind-merge` - Conditional CSS classes
- `lucide-react` - Icon library
- `@radix-ui/*` - Accessible UI primitives

### Key Backend Dependencies (Rust)
- `tauri` - Desktop framework
- `tauri-plugin-*` - Official Tauri plugins
- `serde` + `serde_json` - Serialization
- `tokio` - Async runtime
- `lofty` - Audio metadata reading
- `winreg` - Windows registry access
- `regex` - Regular expressions
- `log` + `env_logger` - Logging
- `uuid` - UUID generation
- `chrono` - Date/time handling
- `base64` - Base64 encoding

## Design Specifications

- **Primary Color**: `#1db954` (Spotify Green)
- **Background**: `#0a0a0a` (Deep Black)
- **UI Style**: Spotify-style dark theme
- **Component Library**: shadcn/ui (New York style)
- **Icons**: Lucide React

## License

MIT License
