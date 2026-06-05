# AuraConvert - 音擎

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="AuraConvert Logo" width="128" height="128">
</p>

<h1 align="center">AuraConvert</h1>

<p align="center">
  基于 Rust & Tauri 的轻量级专业音频转换工具<br>
  支持 13 种输出格式 · 批量转换 · 实时进度 · 视频音频提取
</p>

<p align="center">
  <a href="https://github.com/tabortao/AuraConvert/releases"><img src="https://img.shields.io/github/v/release/tabortao/AuraConvert?style=flat-square&color=1db954" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/platform-Windows-lightgrey?style=flat-square" alt="Platform">
  <a href="docs/ChangeLog.md"><img src="https://img.shields.io/badge/changelog-keep%20a%20changelog-1db954?style=flat-square" alt="Changelog"></a>
</p>

<p align="center">
  <a href="README.md">English</a>
</p>

## 概述

AuraConvert 是一款使用 Tauri v2、Rust 和 React 构建的桌面音频转换器。支持 13 种格式之间的音频转换、批量处理和从视频文件中提取音频。

设计理念：

- 音频转换应该快速、可靠、简单。
- 批量处理是核心功能，而非附加功能。
- 用户应对输出参数（比特率、采样率、声道、音量、速度）拥有完全控制权。
- 界面应简洁、深色、无干扰。

## 亮点

### 核心转换

- **13 种输出格式**：MP3、AAC、FLAC、WAV、M4A、OGG、Opus、ALAC、AC3、AIFF、E-AC3、MP2、WavPack
- **批量转换**：拖拽多个文件或文件夹
- **视频音频提取**：从 MP4、MKV、AVI、MOV、WMV、FLV、WebM 中提取音频
- **封面图保留**：自动保留源文件中的封面图片

### 参数控制

- **比特率**：可调节有损格式的输出比特率
- **采样率**：44100 / 48000 / 96000 / 192000 Hz
- **声道**：单声道 / 立体声
- **位深度**：无损格式支持 16 / 24 / 32 bit
- **音量**：10%–400% 音量缩放
- **速度**：0.25x–4.00x 播放速度变换

### 用户体验

- **实时进度**：单文件进度 + 总进度 + 预计剩余时间
- **压缩率**：转换完成后显示压缩/膨胀率
- **音频元数据**：查看标题、艺术家、专辑、封面
- **深色主题**：Spotify 风格深色界面（`#0a0a0a` 背景，`#1db954` 强调色）
- **多语言**：中文 / 英文切换
- **键盘快捷键**：`Ctrl+Enter` 开始转换，`Delete` 清空列表

### FFmpeg 集成

- **自动检测**：用户配置 → 系统 PATH → Windows 注册表 → 常见安装路径
- **手动配置**：指定自定义 FFmpeg 路径
- **版本检测**：自动检测 FFmpeg 版本
- **实时进度**：解析 `-progress pipe:1` 输出获取精确进度

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 桌面框架 | Tauri | v2 |
| 后端 | Rust | 2024 Edition |
| 前端 | React | v19 |
| TypeScript | ~5.7 |
| 构建工具 | Vite | v6 |
| CSS | Tailwind CSS | v4 |
| UI | Radix UI + shadcn/ui (New York) |
| 状态管理 | Zustand | v5 |
| 国际化 | react-i18next | v15 |
| 音频元数据 | lofty | v0.21 |
| 异步运行时 | tokio | v1 (full) |

## 快速开始

### 前置条件

- Rust >= 1.70
- Node.js >= 18
- pnpm >= 8
- FFmpeg >= 5.0
- Windows: MSVC Build Tools（C++ 桌面开发）

### 开发

```bash
git clone https://github.com/tabortao/AuraConvert.git
cd AuraConvert

pnpm install
pnpm tauri dev
```

应用将在 `http://localhost:1420` 可用。

### 构建

```bash
pnpm tauri build
```

输出文件位于 `src-tauri/target/release/bundle/`。

### 测试

```bash
cd src-tauri
cargo test
```

## 项目结构

```text
AuraConvert/
├── src/                          # React 前端
│   ├── components/               # UI 组件
│   ├── hooks/                    # 自定义 React Hooks
│   ├── stores/                   # Zustand 状态管理
│   ├── i18n/                     # 国际化 (zh/en)
│   ├── types/                    # TypeScript 类型定义
│   └── utils/                    # 工具函数
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── commands/             # Tauri IPC 命令
│   │   ├── converter/            # 转换逻辑 (format_config, args_builder, smart_optimize)
│   │   ├── ffmpeg/               # FFmpeg 集成 (detector, runner, parser)
│   │   ├── models/               # 数据模型
│   │   └── utils/                # 路径工具
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                         # 文档
│   ├── ChangeLog.md
│   └── COMMON_ERRORS.md
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Tauri 命令

| 命令 | 参数 | 返回值 | 描述 |
|---------|------------|--------|-------------|
| `detect_ffmpeg` | — | `FfmpegStatus` | 自动检测 FFmpeg 路径和版本 |
| `start_conversion` | `files, params` | `String` | 开始批量转换 |
| `cancel_conversion` | — | `()` | 取消当前转换 |
| `read_audio_info` | `file_path: String` | `AudioInfo` | 读取音频元数据 |
| `select_files` | — | `Vec<String>` | 打开文件选择对话框 |
| `select_output_dir` | — | `Option<String>` | 打开目录选择对话框 |
| `get_file_metadata` | `path: String` | `{size: u64}` | 获取文件大小 |

## 支持的格式

| 格式 | 类型 | 编码器 | 最大比特率 | 备注 |
|--------|------|-------|-------------|-------|
| MP3 | 有损 | `libmp3lame` | 320kbps | |
| AAC | 有损 | `aac` | 512kbps | |
| M4A | 有损 | `aac` | 512kbps | 需要 `-f ipod` |
| OGG | 有损 | `libvorbis` | 500kbps | 使用 `-q:a` 质量模式 |
| Opus | 有损 | `opus` | 510kbps | 需要 `-strict -2` |
| AC3 | 有损 | `ac3` | 640kbps | |
| E-AC3 | 有损 | `eac3` | 1024kbps | |
| MP2 | 有损 | `mp2` | 384kbps | |
| FLAC | 无损 | `flac` | — | 支持位深度 |
| WAV | 无损 | `pcm_s16le` | — | 支持位深度 |
| ALAC | 无损 | `alac` | — | |
| AIFF | 无损 | `pcm_s16be` | — | |
| WavPack | 无损 | `wavpack` | — | |

## 设计

- **主色**：`#1db954`（Spotify 绿色）
- **背景**：`#0a0a0a`（深黑色）
- **UI 风格**：Spotify 风格深色主题，shadcn/ui (New York)
- **图标**：Lucide React

## 文档

| 文档 | 描述 |
|----------|-------------|
| [docs/ChangeLog.md](docs/ChangeLog.md) | 变更日志 |
| [docs/COMMON_ERRORS.md](docs/COMMON_ERRORS.md) | 常见错误与经验总结 |

## 许可证

MIT License

## 致谢

- [Tauri](https://tauri.app/) — 跨平台桌面框架
- [FFmpeg](https://ffmpeg.org/) — 多媒体处理
- [lofty](https://github.com/Serial-ATA/lofty) — Rust 音频元数据库
- [React](https://react.dev/) — UI 框架
- [Tailwind CSS](https://tailwindcss.com/) — 实用优先的 CSS 框架