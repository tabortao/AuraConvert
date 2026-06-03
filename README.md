# AuraConvert - 音擎

> A Lightweight & Professional Audio Converter Powered by Rust & Tauri

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="AuraConvert Logo" width="128" height="128">
</p>

<p align="center">
  <strong>音擎</strong> — 一款基于 Rust + Tauri 构建的轻量级专业音频转换器<br>
  支持 21 种输出格式 · 批量转换 · 实时进度 · 视频音频提取 · 国际化
</p>

---

## ✨ 功能特性

### 核心转换
- **21 种输出格式**：MP3、AAC、FLAC、WAV、M4A、OGG、Opus、ALAC、WMA、AC3、AIFF、E-AC3、DTS、MP2、WavPack、TTA、aptX、SBC、TrueHD、MLP、DFPWM
- **批量转换**：支持拖拽多个文件/文件夹同时转换
- **视频音频提取**：支持从 MP4、MKV、AVI、MOV、WMV、FLV、WebM 等视频文件中提取音频
- **专辑封面保留**：自动保留音频文件的封面图片

### 参数调节
- **比特率**：可调节输出比特率（有损格式）
- **采样率**：支持常见采样率选择（44100/48000/96000/192000 Hz）
- **声道数**：单声道/立体声
- **位深度**：16/24/32 bit（无损格式）
- **音量调节**：10%–400% 音量缩放
- **速度调节**：0.25x–4.00x 播放速度变换

### 用户体验
- **实时进度条**：每个文件独立进度 + 总进度 + ETA 预估
- **压缩比显示**：转换完成后显示压缩比率
- **音频信息查看**：读取并展示音频元数据（标题、艺术家、专辑、封面等）
- **深色主题**：Spotify 风格深色 UI，`#0a0a0a` 背景 + `#1db954` 主色调
- **国际化**：支持中文/英文切换
- **键盘快捷键**：`Ctrl+Enter` 开始转换，`Delete` 清空列表

### FFmpeg 集成
- **自动检测**：按优先级链自动查找 FFmpeg（用户配置 → 系统 PATH → 注册表 → 常见安装路径）
- **手动配置**：支持手动指定 FFmpeg 路径
- **版本检测**：自动检测 FFmpeg 版本信息
- **实时进度**：通过 `-progress pipe:1` 解析 FFmpeg 输出获取精确进度

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **桌面框架** | [Tauri](https://tauri.app/) | v2.11 |
| **后端语言** | [Rust](https://www.rust-lang.org/) | 2021 Edition |
| **前端框架** | [React](https://react.dev/) | v19 |
| **类型系统** | [TypeScript](https://www.typescriptlang.org/) | ~5.7 |
| **构建工具** | [Vite](https://vitejs.dev/) | v6 |
| **CSS 框架** | [Tailwind CSS](https://tailwindcss.com/) | v4 |
| **UI 组件** | [Radix UI](https://www.radix-ui.com/) + shadcn/ui (New York) |
| **状态管理** | [Zustand](https://zustand.docs.pmnd.rs/) | v5 |
| **国际化** | [react-i18next](https://react.i18next.com/) | v15 |
| **音频元数据** | [lofty](https://github.com/Serial-ATA/lofty) | v0.21 |
| **异步运行时** | [tokio](https://tokio.rs/) | v1 (full) |

### 项目结构

```
AuraConvert/
├── src/                          # 前端源码
│   ├── components/                # React 组件
│   │   ├── Layout.tsx             # 主布局（Header + 侧边栏 + 内容区）
│   │   ├── DropZone.tsx           # 拖拽上传区域
│   │   ├── FileList.tsx            # 文件列表 + 总进度条
│   │   ├── FileItem.tsx           # 单个文件行（状态/进度/压缩比）
│   │   ├── SettingsPanel.tsx       # 设置面板（FFmpeg/格式/参数/输出）
│   │   ├── FormatSelector.tsx      # 输出格式选择器（21种格式）
│   │   ├── ParamPanel.tsx          # 参数调节面板
│   │   ├── ProgressBar.tsx         # 进度条组件
│   │   ├── ConvertButton.tsx       # 开始/取消/清空按钮
│   │   ├── AudioInfoDialog.tsx     # 音频信息弹窗（封面+元数据）
│   │   └── ThemeToggle.tsx         # 深色/浅色主题切换
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── useFFmpeg.ts            # FFmpeg 检测 + 路径管理
│   │   ├── useConversion.ts        # 转换流程控制 + 事件监听
│   │   ├── useAudioInfo.ts         # 音频信息读取
│   │   └── useKeyboardShortcuts.ts # 键盘快捷键
│   ├── stores/                    # Zustand 状态管理
│   │   ├── conversionStore.ts      # 转换状态（文件列表/进度/参数）
│   │   └── settingsStore.ts       # 设置持久化（tauri-plugin-store）
│   ├── i18n/                      # 国际化
│   │   ├── index.ts                # i18next 配置
│   │   ├── zh.json                 # 中文翻译
│   │   └── en.json                 # 英文翻译
│   ├── types/                     # TypeScript 类型定义
│   ├── utils/                     # 工具函数
│   ├── styles/                    # 全局样式
│   ├── App.tsx                    # 根组件
│   └── main.tsx                   # 入口文件
│
├── src-tauri/                     # Rust 后端
│   ├── src/
│   │   ├── commands/              # Tauri 命令（IPC 调用）
│   │   │   ├── ffmpeg.rs          # detect_ffmpeg / check_ffmpeg_version
│   │   │   ├── convert.rs         # start_conversion / cancel_conversion
│   │   │   ├── audio_info.rs       # read_audio_info（lofty + ffprobe）
│   │   │   └── file_ops.rs        # select_files / select_output_dir
│   │   ├── converter/             # 转换逻辑
│   │   │   ├── format_config.rs   # 21 种格式配置（编码器/扩展名/参数）
│   │   │   ├── args_builder.rs    # FFmpeg 命令行参数构建器
│   │   │   └── smart_optimize.rs  # 智能参数优化
│   │   ├── ffmpeg/                # FFmpeg 集成
│   │   │   ├── detector.rs        # FFmpeg 自动检测（PATH/注册表/常见路径）
│   │   │   ├── runner.rs          # FFmpeg 进程管理（异步/进度/取消）
│   │   │   └── parser.rs          # -progress 输出解析器
│   │   ├── models/                # 数据模型
│   │   ├── utils/                 # 工具函数（路径构建等）
│   │   ├── lib.rs                 # Tauri 入口（插件注册/命令注册/设置初始化）
│   │   └── main.rs                # Windows 子系统入口
│   ├── Cargo.toml                 # Rust 依赖
│   ├── tauri.conf.json            # Tauri 配置
│   ├── capabilities/default.json   # 权限配置
│   └── icons/                     # 应用图标
│
├── package.json                   # Node.js 依赖
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
└── index.html                     # HTML 入口
```

### 架构设计

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Zustand   │  │ Tauri    │  │   React-i18next    │  │
│  │ Stores    │  │ Events   │  │   (zh / en)        │  │
│  └────┬─────┘  └────┬─────┘  └───────────────────┘  │
│       │              │  invoke / listen               │
├───────┼──────────────┼───────────────────────────────┤
│       │     Tauri IPC │                               │
├───────┼──────────────┼───────────────────────────────┤
│       ▼              ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │              Rust Backend (Tauri v2)           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │ Commands │  │ Converter│  │   FFmpeg     │  │   │
│  │  │ (8 APIs) │  │ (args    │  │   Detector   │  │   │
│  │  │          │  │  builder)│  │   Runner     │  │   │
│  │  └──────────┘  └──────────┘  │   Parser     │  │   │
│  │                                └──────────────┘  │   │
│  │  ┌──────────┐  ┌──────────┐                     │   │
│  │  │ lofty    │  │ tauri-   │                     │   │
│  │  │ (metadata│  │ plugin-  │                     │   │
│  │  │  reading)│  │  store   │                     │   │
│  │  └──────────┘  └──────────┘                     │   │
│  └──────────────────────────────────────────────┘   │
│                       │                              │
│                       ▼                              │
│              ┌────────────────┐                       │
│              │     FFmpeg      │                       │
│              │  (external CLI) │                       │
│              └────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 开发指南

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| **Rust** | >= 1.70 | [安装指南](https://www.rust-lang.org/tools/install) |
| **Node.js** | >= 18 | [下载地址](https://nodejs.org/) |
| **pnpm** | >= 8 | `npm install -g pnpm` |
| **FFmpeg** | >= 5.0 | [下载地址](https://ffmpeg.org/download.html) |
| **Windows** | — | 需要 MSVC Build Tools（C++ 桌面开发） |

### 安装依赖

```bash
# 克隆项目
git clone <repo-url>
cd AuraConvert

# 安装前端依赖
pnpm install

# Rust 依赖会在首次编译时自动下载
```

### 开发模式

```bash
# 启动开发服务器（前端热更新 + Rust 后端）
pnpm tauri dev
```

开发服务器启动后：
- 前端：`http://localhost:1420`
- 窗口大小：1100×720（最小 900×600）

### 编译发布

```bash
# 编译 Rust 后端（release 模式）
cd src-tauri
cargo build --release

# 完整打包（前端 + 后端 → 安装包）
cd ..
pnpm tauri build
```

产物位于 `src-tauri/target/release/bundle/`。

### 运行测试

```bash
cd src-tauri
cargo test
```

包含以下测试：
- `format_config` — 21 种格式配置完整性验证
- `args_builder` — FFmpeg 参数构建（MP3/音量/速度/视频提取/无损/进度输出）
- `smart_optimize` — 智能参数优化（无损保留/有损限制/声道限制）
- `parser` — 进度行解析 + 进度百分比计算
- `path_utils` — 输出路径构建（同目录/自定义目录/后缀模式）

---

## 📡 Tauri 命令接口

后端通过 Tauri IPC 暴露以下命令供前端调用：

| 命令 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `detect_ffmpeg` | — | `FfmpegStatus` | 自动检测 FFmpeg 路径和版本 |
| `check_ffmpeg_version` | `path: String` | `String` | 检查指定路径的 FFmpeg 版本 |
| `start_conversion` | `files, params` | `String` | 开始批量转换 |
| `cancel_conversion` | — | `()` | 取消当前转换 |
| `read_audio_info` | `file_path: String` | `AudioInfo` | 读取音频元数据 |
| `select_files` | — | `Vec<String>` | 打开文件选择对话框 |
| `select_output_dir` | — | `Option<String>` | 打开目录选择对话框 |

### Tauri 事件

后端通过事件系统向前端推送实时数据：

| 事件名 | 数据 | 说明 |
|--------|------|------|
| `conversion-progress` | `{fileId, progress, speed}` | 单文件转换进度 |
| `file-status-changed` | `{fileId, status}` | 文件状态变更（converting/cancelled） |
| `file-completed` | `{fileId, outputPath, outputSize, compressionRatio}` | 文件转换完成 |
| `file-failed` | `{fileId, status, error}` | 文件转换失败 |
| `total-progress` | `{completed, total, percentage, eta}` | 总进度更新 |

---

## 🔌 插件依赖

| 插件 | 用途 |
|------|------|
| `tauri-plugin-fs` | 文件系统访问 |
| `tauri-plugin-dialog` | 原生文件/目录选择对话框 |
| `tauri-plugin-shell` | 外部进程管理 |
| `tauri-plugin-process` | 进程管理 |
| `tauri-plugin-store` | 本地设置持久化存储 |

---

## 🎨 设计规范

- **主色调**：`#1db954`（Spotify 绿）
- **背景色**：`#0a0a0a`（深黑）
- **UI 风格**：Spotify 风格深色主题
- **组件库**：shadcn/ui (New York 风格)
- **图标**：Lucide React

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Tauri](https://tauri.app/) — 跨平台桌面应用框架
- [FFmpeg](https://ffmpeg.org/) — 强大的多媒体处理工具
- [lofty](https://github.com/Serial-ATA/lofty) — Rust 音频元数据解析库
- [React](https://react.dev/) — 前端 UI 框架
- [Tailwind CSS](https://tailwindcss.com/) — 原子化 CSS 框架
