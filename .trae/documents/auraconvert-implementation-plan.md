# AuraConvert (音擎) 实施计划

> A Lightweight & Professional Audio Converter Powered by Rust & Tauri

## 概述

AuraConvert 是一款基于 **Rust + Tauri v2** 的桌面音频转换工具，支持 21 种输出格式、批量转换、视频音频提取、实时进度追踪、智能优化等功能。

## 技术栈

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | Tauri v2.11.1 | 最新稳定版，插件系统成熟 |
| 后端 | Rust | 高性能、内存安全 |
| 前端 | React 19 + TypeScript + Vite 6 | 生态成熟，社区资源丰富 |
| UI | Tailwind CSS v4 + shadcn/ui (New York) | 现代暗色主题，组件可定制 |
| 状态管理 | Zustand v5 | 轻量，无 boilerplate |
| FFmpeg 调用 | `tokio::process::Command` | 异步非阻塞，不阻塞 UI |
| 元数据读取 | lofty (音频) + ffprobe (视频) | 原生 Rust，格式覆盖广 |
| 设置持久化 | tauri-plugin-store | 官方插件，跨端可用 |
| 国际化 | react-i18next | 中英文支持 |

## 项目结构

```
AuraConvert/
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── index.html
├── src/                              # 前端源码
│   ├── main.tsx                      # 入口
│   ├── App.tsx                       # 根组件
│   ├── components/
│   │   ├── Layout.tsx                # 应用布局
│   │   ├── DropZone.tsx              # 拖拽区域
│   │   ├── FileList.tsx              # 文件列表
│   │   ├── FileItem.tsx              # 单文件行
│   │   ├── ConvertButton.tsx         # 转换按钮
│   │   ├── SettingsPanel.tsx         # 设置面板
│   │   ├── FormatSelector.tsx        # 格式选择器
│   │   ├── ParamPanel.tsx            # 参数面板
│   │   ├── AudioInfoDialog.tsx       # 音频信息对话框
│   │   ├── ProgressBar.tsx           # 进度条
│   │   └── ThemeToggle.tsx           # 主题切换
│   ├── hooks/
│   │   ├── useConversion.ts          # 转换状态
│   │   ├── useFFmpeg.ts              # FFmpeg 状态
│   │   └── useAudioInfo.ts           # 音频信息
│   ├── stores/
│   │   ├── conversionStore.ts        # 转换状态 store
│   │   └── settingsStore.ts           # 设置 store
│   ├── utils/
│   │   ├── formatUtils.ts            # 格式定义
│   │   ├── ffmpegArgs.ts             # FFmpeg 参数工具
│   │   └── fileUtils.ts              # 文件工具
│   ├── types/
│   │   └── index.ts                  # TypeScript 类型
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── zh.json
│   │   └── en.json
│   └── styles/
│       └── globals.css               # Tailwind + 暗色主题
├── src-tauri/                        # Rust 后端
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs                    # Tauri 入口，插件初始化
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── ffmpeg.rs             # FFmpeg 检测/版本
│   │   │   ├── convert.rs            # 转换命令
│   │   │   ├── audio_info.rs         # 音频信息读取
│   │   │   └── file_ops.rs           # 文件操作
│   │   ├── ffmpeg/
│   │   │   ├── mod.rs
│   │   │   ├── detector.rs           # FFmpeg 路径检测
│   │   │   ├── runner.rs             # FFmpeg 进程管理
│   │   │   └── parser.rs             # 进度输出解析
│   │   ├── converter/
│   │   │   ├── mod.rs
│   │   │   ├── args_builder.rs       # FFmpeg 参数构建
│   │   │   ├── format_config.rs      # 21 种格式配置
│   │   │   └── smart_optimize.rs     # 智能优化
│   │   ├── models/
│   │   │   ├── mod.rs
│   │   │   ├── audio_file.rs
│   │   │   ├── convert_params.rs
│   │   │   └── convert_result.rs
│   │   └── utils/
│   │       ├── mod.rs
│   │       └── path_utils.rs         # 路径工具
│   └── icons/
│       ├── icon.ico
│       ├── icon.png
│       └── tray-icon.png
```

## UI 布局

```
+----------------------------------------------------------+
|  🎵 AuraConvert v1.0.0                  [FFmpeg✓] [🌙]  |
+----------------------------------------------------------+
| 设置面板 (280px) |  主内容区                               |
|                 |  +----------------------------------+   |
| ▼ FFmpeg 配置   |  |  📂 拖拽文件到此处，或点击选择     |   |
|   状态: ✅ 已找到|  |     支持音频和视频文件             |   |
|   版本: 7.0.1  |  +----------------------------------+   |
|   [浏览] [检测] |  | 总进度: [████████░░] 67%          |   |
|                 |  | 已完成 5/8  预计剩余 2m 30s        |   |
| ▼ 输出格式      |  +----------------------------------+   |
|   [MP3      ▼] |  | 📄 song1.flac  35MB  FLAC  [████] |   |
|                 |  | 📄 song2.wav   45MB  WAV   ✅ 72%  |   |
| ▼ 参数设置      |  | 📄 video1.mp4  120MB MP4   ✅ 65% |   |
|   比特率: 320k  |  | 📄 song3.mp3   8MB   MP3   ❌ 错误 |   |
|   采样率: 48000 |  | 📄 song4.m4a   12MB  M4A   ⏳ 等待 |   |
|   声道: 立体声   |  +----------------------------------+   |
|   音量: 100%    |  |  [▶ 开始转换]  [✕ 取消]  [🗑 清空] |   |
|   速度: 1.00x   |  +----------------------------------+   |
|                 |                                         |
| ▼ 输出目录      |                                         |
|   ● 与源文件相同 |                                         |
|   ○ 自定义目录   |                                         |
|   ○ 每次询问     |                                         |
+----------------------------------------------------------+
```

## 分阶段实施

### 阶段 1：项目脚手架

**目标**：创建可运行的空壳应用，包含基础布局和暗色主题。

**操作**：
1. 使用 `pnpm create tauri-app . --template react-ts` 初始化项目
2. 安装 Tauri 插件：`cargo tauri add fs dialog shell process store`
3. 安装前端依赖：zustand, react-dropzone, react-i18next, i18next, lucide-react, clsx, tailwind-merge, class-variance-authority, @radix-ui 组件
4. 初始化 Tailwind CSS v4 + shadcn/ui (New York 风格)
5. 配置暗色主题 CSS 变量（Spotify 风格：`#0a0a0a` 背景，`#1db954` 主色）
6. 创建基础 Layout 组件（header + sidebar + main）
7. 配置 Tauri capabilities 权限

**关键文件**：
- `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- `src/styles/globals.css` — 暗色主题变量
- `src/main.tsx`, `src/App.tsx`, `src/components/Layout.tsx`
- `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json`
- `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`

### 阶段 2：FFmpeg 集成

**目标**：自动检测 FFmpeg、版本检查、手动配置、下载提示。

**操作**：
1. 实现 FFmpeg 检测器（优先级链）：
   - `where ffmpeg`（PATH 环境变量）
   - Windows 注册表 `HKLM/HKCU\SOFTWARE\FFmpeg`
   - 常见安装路径（`C:\ffmpeg`, `Program Files`, Scoop 等）
   - 用户手动配置（tauri-plugin-store 持久化）
2. FFmpeg 版本检查（`ffmpeg -version`）
3. 前端 FFmpeg 状态 Hook（`useFFmpeg`）
4. 设置面板 UI：状态指示器、路径输入、浏览按钮、重新检测
5. 未找到时显示下载提示和链接：
   - Windows: `https://www.gyan.dev/ffmpeg/builds/`
   - macOS: `https://evermeet.cx/ffmpeg/`
   - 通用: `https://ffmpeg.org/download.html`

**关键文件**：
- `src-tauri/src/ffmpeg/detector.rs` — 检测逻辑
- `src-tauri/src/commands/ffmpeg.rs` — Tauri 命令
- `src/hooks/useFFmpeg.ts` — 前端 Hook
- `src/components/SettingsPanel.tsx` — FFmpeg 配置 UI

### 阶段 3：文件输入与管理

**目标**：拖拽文件/文件夹、文件类型验证、文件列表显示。

**操作**：
1. 定义 TypeScript 类型（AudioFile, ConvertParams, OutputFormat 等）
2. 实现拖拽区域（react-dropzone，支持文件 + 文件夹）
3. 文件类型验证（音频 + 视频扩展名白名单）
4. Zustand store 管理文件列表状态
5. 文件列表 UI（文件名、格式标签、大小、时长、删除按钮）
6. 文件选择对话框（Tauri dialog 插件）

**关键文件**：
- `src/types/index.ts` — 所有类型定义
- `src/utils/formatUtils.ts` — 格式常量（21 种输出格式 + 输入格式白名单）
- `src/utils/fileUtils.ts` — 文件大小格式化等工具
- `src/stores/conversionStore.ts` — 文件列表状态
- `src/components/DropZone.tsx`, `src/components/FileList.tsx`, `src/components/FileItem.tsx`

### 阶段 4：音频信息与元数据

**目标**：读取音频/视频元数据，显示详细信息，提取封面图。

**操作**：
1. Rust 端使用 lofty 读取音频元数据（标题、艺术家、专辑、时长、比特率、采样率、声道、位深度、封面图）
2. 视频文件回退到 ffprobe（JSON 输出解析）
3. 封面图提取并转为 base64 传给前端
4. 前端音频信息对话框（shadcn/ui Dialog）

**关键文件**：
- `src-tauri/src/commands/audio_info.rs` — 元数据读取命令
- `src-tauri/src/models/audio_file.rs` — 数据模型
- `src/components/AudioInfoDialog.tsx` — 信息展示 UI
- `src/hooks/useAudioInfo.ts` — 前端 Hook

### 阶段 5：转换引擎（核心）

**目标**：完整的 FFmpeg 调用、参数构建、进度解析、事件推送。

**操作**：
1. **格式配置**（`format_config.rs`）：为 21 种格式定义编码器、容器、默认参数

   | 格式 | 编码器 | 容器 | 无损 |
   |------|--------|------|------|
   | MP3 | libmp3lame | mp3 | 否 |
   | AAC | aac | aac | 否 |
   | FLAC | flac | flac | 是 |
   | WAV | pcm_s16le/24le/32le | wav | 是 |
   | M4A | aac | ipod | 否 |
   | OGG | libvorbis | ogg | 否 |
   | Opus | libopus | ogg | 否 |
   | ALAC | alac | mp4 | 是 |
   | WMA | wmav2 | asf | 否 |
   | AC3 | ac3 | ac3 | 否 |
   | AIFF | pcm_s16be | aiff | 是 |
   | E-AC3 | eac3 | eac3 | 否 |
   | DTS | dca | dts | 否 |
   | MP2 | mp2 | mp2 | 否 |
   | WavPack | wavpack | wv | 是 |
   | TTA | tta | tta | 是 |
   | aptX | libaptx* | aptx | 否 |
   | SBC | sbc | sbc | 否 |
   | TrueHD | truehd | truehd | 是 |
   | MLP | mlp | mlp | 是 |
   | DFPWM | dfpwm | dfpwm | 否 |

   > *aptX/SBC 可能需要自定义编译的 FFmpeg，UI 中检测不支持时禁用并提示

2. **参数构建器**（`args_builder.rs`）：
   - 音量调整：`volume=` 滤镜（10%-400%）
   - 速度调整：`atempo` 滤镜链（0.25x-4.00x，超出 [0.5,2.0] 范围时链式拼接）
   - 视频音频提取：`-vn` 或 `-map a:0`
   - 封面保留：`-map_metadata 0` + `-c:v copy`
   - 进度输出：`-progress pipe:1 -nostats`

3. **进度解析**（`parser.rs`）：解析 `out_time_us=xxx` 和 `progress=end`

4. **进程运行器**（`runner.rs`）：
   - `tokio::process::Command` 异步执行
   - 流式读取 stdout 进度信息
   - 通过 Tauri event 实时推送到前端
   - AtomicBool 取消机制 + `child.kill()`

5. **转换命令**（`convert.rs`）：
   - 串行转换（避免 IO 争用）
   - 每文件完成/失败事件
   - 总进度 + ETA 计算

6. **前端集成**：
   - `useConversion` Hook 监听 Tauri 事件
   - 格式选择器、参数面板、转换按钮

**关键文件**：
- `src-tauri/src/converter/format_config.rs`
- `src-tauri/src/converter/args_builder.rs`
- `src-tauri/src/ffmpeg/parser.rs`
- `src-tauri/src/ffmpeg/runner.rs`
- `src-tauri/src/commands/convert.rs`
- `src/hooks/useConversion.ts`
- `src/components/FormatSelector.tsx`, `src/components/ParamPanel.tsx`, `src/components/ConvertButton.tsx`

### 阶段 6：智能优化

**目标**：根据源文件自动推荐最佳输出参数。

**规则**：
- 无损→有损：推荐目标格式最高比特率
- 有损→有损：使用源比特率（不超过目标格式上限）
- 任意→无损：保持源采样率和声道
- 采样率：保持源值（不超过目标格式上限）
- 声道：有损最多立体声，无损保持源声道

**关键文件**：
- `src-tauri/src/converter/smart_optimize.rs`
- `src/utils/formatUtils.ts`（前端优化逻辑）

### 阶段 7：进度与结果 UI

**目标**：实时进度条、ETA、压缩比、错误显示。

**操作**：
1. 单文件进度条（绿色渐变 + 百分比 + 速度）
2. 总进度区域（进度条 + 已完成/总数 + ETA）
3. 成功结果：显示压缩比（如 "压缩 65%"）
4. 失败结果：红色错误图标 + 错误原因（hover 查看完整信息）
5. ETA 格式化（"X 分 X 秒" 或 "X 小时 X 分"）

**关键文件**：
- `src/components/ProgressBar.tsx`
- `src/components/FileItem.tsx`（集成进度条）

### 阶段 8：设置持久化

**目标**：所有用户设置持久化到本地存储。

**设置项**：
- FFmpeg 路径
- 默认输出格式、比特率、采样率、声道
- 输出目录模式（与源相同 / 自定义 / 每次询问）
- 文件名模板（保持原名 / 添加后缀）
- 语言（中文/英文）
- 主题（暗色/亮色）

**关键文件**：
- `src/stores/settingsStore.ts`
- `src-tauri/src/utils/path_utils.rs`
- `src/components/SettingsPanel.tsx`

### 阶段 9：UI 精细化与国际化

**目标**：完整的暗色主题 UI、中英文支持。

**操作**：
1. i18n 配置（react-i18next + zh.json/en.json）
2. 所有 UI 文本使用 i18n key
3. 键盘快捷键（Ctrl+O 打开文件、Ctrl+Enter 开始转换、Escape 取消、Delete 删除）
4. 错误处理与友好提示
5. 虚拟滚动优化（大量文件时）

**关键文件**：
- `src/i18n/index.ts`, `src/i18n/zh.json`, `src/i18n/en.json`
- 所有组件文件（添加 i18n 支持）

### 阶段 10：测试与构建

**目标**：确保稳定性，构建发布版本。

**测试**：
- Rust 单元测试：进度解析器、参数构建器、格式配置完整性
- 集成测试：各种格式转换、视频提取、错误处理
- 测试矩阵：基础转换、无损↔有损、视频提取、批量、音量/速度、封面保留、大文件、错误处理

**构建**：
```bash
pnpm tauri dev    # 开发模式
pnpm tauri build  # 发布构建
```

## 关键架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| FFmpeg 调用 | `tokio::process::Command` | 异步非阻塞 |
| 进度获取 | `-progress pipe:1` | key=value 格式，比 stderr 正则更可靠 |
| 元数据 | lofty + ffprobe | 原生 Rust + 视频回退 |
| 并发策略 | 串行转换 | 避免 IO 争用，简化进度 |
| 取消机制 | AtomicBool + kill() | 简单可靠 |
| 前端状态 | Zustand | 轻量无 boilerplate |

## 潜在挑战与应对

1. **aptX/SBC 编码器**：标准 FFmpeg 可能不包含 → UI 检测 `ffmpeg -encoders`，不支持时禁用
2. **大文件内存**：lofty 仅读文件头，不加载音频数据
3. **Windows 路径**：特殊字符路径用引号包裹
4. **进度精度**：极短音频设置最小更新间隔 100ms
5. **批量性能**：前端虚拟滚动（@tanstack/react-virtual）

## 文件创建顺序（按依赖）

1. **项目基础**：package.json → vite.config.ts → tsconfig → index.html → globals.css → main.tsx → App.tsx → Cargo.toml → tauri.conf.json → capabilities → main.rs → lib.rs
2. **类型与工具**：types/index.ts → formatUtils.ts → fileUtils.ts → ffmpegArgs.ts → Rust utils → models
3. **Rust 模块**：ffmpeg/ → converter/ → commands/
4. **前端 Store/Hook**：conversionStore → settingsStore → hooks
5. **UI 组件**：Layout → ThemeToggle → DropZone → FileList → FileItem → ProgressBar → ConvertButton → FormatSelector → ParamPanel → SettingsPanel → AudioInfoDialog
6. **国际化**：i18n/index.ts → zh.json → en.json
