# Change Log

## [v1.1.5] - 2026-06-04

### Fixed

- **拖拽失效**: 修复 `Upload` 图标导入被误删导致组件崩溃，恢复拖拽功能

## [v1.1.4] - 2026-06-04

### Changed

- **Toast 位置**: 从右下角固定位置改为状态栏上方，视觉上更协调

## [v1.1.3] - 2026-06-04

### Changed

- **Toast 通知优化**: 每批转换只显示一条汇总提示，包含完成/失败数量和总耗时
  - 全部成功: `全部完成 (3 个文件, 耗时 12.5s)`
  - 部分失败: `完成 2/3 (1 个失败, 耗时 12.5s)`
  - 全部失败: `全部失败 (3 个文件, 耗时 0.3s)`

## [v1.1.2] - 2026-06-04

### Fixed

- **拖拽重复文件**: 修复拖入文件时同一文件出现两次的问题
  - 使用 `useConversionStore.getState()` 避免 useEffect 多次注册
  - 添加路径去重逻辑，已存在的文件不会重复添加

### Added

- **Toast 通知**: 转换完成/失败时显示 Toast 提示，包含完成时间戳
- **文件操作按钮**: 文件列表每行增加操作按钮
  - 删除按钮（仅非转换中可用）：从列表中移除文件
  - 打开文件夹按钮（转换完成可见）：在资源管理器中打开输出目录

## [v1.1.1] - 2026-06-04

### Fixed

- **拖拽功能**: 使用 Tauri v2 原生 `onDragDropEvent` API 替代 HTML5 拖拽事件
  - HTML5 原生拖拽在 Tauri v2 中不可用（webview 不会触发 DOM drag/drop 事件）
  - 通过 `getCurrentWindow().onDragDropEvent()` 监听系统级拖放事件
  - 添加文件扩展名过滤，仅接受支持的音频/视频格式
  - 保留拖拽视觉反馈（overlay + 动画）

## [v1.1.0] - 2026-06-04

### Changed

- **输出格式精简**: 根据 FFmpeg 8.1.1 essentials build 文档，移除不支持的格式
  - 移除 DTS (dca 编码器不存在于 essentials build)
  - 移除 WMA (wmav2 编码器不存在于 essentials build)
  - 移除 TTA (tta 编码器不存在于 essentials build)
  - Opus 改用原生 `opus` 编码器 (替代 `libopus`，无需外部库)
  - 输出格式从 16 种减少为 **13 种**
  - 保留: MP3、AAC、FLAC、WAV、M4A、OGG、Opus、ALAC、AC3、AIFF、E-AC3、MP2、WavPack

## [v1.0.19] - 2026-06-04

### Fixed

- **DTS 编码错误**: 尝试添加强制采样率和通道数设置

## [v1.0.18] - 2026-06-04

### Fixed

- **DTS/AC3/E-AC3/Opus/MP2 编码错误**: 进一步简化命令以匹配用户工作命令
  - 移除了 `-hide_banner`、`-progress`、`-nostats` 参数

## [v1.0.17] - 2026-06-04

### Fixed

- **DTS/AC3/E-AC3/Opus/MP2 编码错误**: 修复严格编码器格式的编码问题
  - 对这些格式跳过所有音频滤镜（音量、速度调整），避免参数冲突
  - 对这些格式跳过采样率和通道数设置，让 FFmpeg 自动处理

## [v1.0.16] - 2026-06-04

### Fixed

- **DTS/AC3/E-AC3/Opus/MP2 编码错误**: 初步修复，跳过流映射和元数据复制

## [v1.0.15] - 2026-06-04

### Fixed

- **DTS 编码错误**: 添加 `-strict -2` 参数以启用 DTS 实验性功能

## [v1.0.14] - 2026-06-04

### Fixed

- **Opus 编码错误**: 修复 MP3 转 Opus 时的编码参数错误
  - libopus 编码器对采样率和通道数有严格要求
  - 将 Opus 添加到自动处理列表，让 FFmpeg 自动处理格式转换

## [v1.0.13] - 2026-06-04

### Fixed

- **OGG Vorbis 编码错误**: 修复 MP3 转 OGG 时的编码参数错误
  - 改回使用比特率模式（-b:a），与用户命令行一致
  - 恢复 OGG 和 Opus 的采样率设置支持（Opus 后续在 v1.0.14 中调整）
  - 仅对 AC3、E-AC3、DTS 禁用强制采样率/通道数设置

## [v1.0.12] - 2026-06-04

### Fixed

- **OGG Vorbis 编码错误**: 尝试使用质量模式（未解决问题）
  - 移除了警告：`is_complete` 变量未使用的问题

## [v1.0.11] - 2026-06-04

### Fixed

- **OGG Vorbis 编码错误**: 修复 MP3 转 OGG 时的编码参数错误
  - libvorbis 编码器对采样率和通道数有严格要求
  - 将 OGG、Opus、DTS 也加入到自动处理列表中

## [v1.0.10] - 2026-06-04

### Fixed

- **AC3 编码错误**: 修复 MP3 转 AC3 时的编码参数错误
  - AC3 编码器对采样率和通道数有严格要求（通常只支持 48000 Hz）
  - 移除了对 AC3 和 E-AC3 格式的采样率强制设置，让 FFmpeg 自动处理
  - 移除了对 AC3 和 E-AC3 格式的通道数强制设置，让 FFmpeg 自动处理

## [v1.0.9] - 2026-06-04

### Fixed

- **AC3 编码错误**: 尝试修复 MP3 转 AC3 时的编码参数错误（简化参数构建）

## [v1.0.8] - 2026-06-04

### Fixed

- **AC3 编码错误**: 尝试修复 MP3 转 AC3 时的编码参数错误（改为 ac3_fixed，但效果不佳）
- **拖拽功能**: 进一步修复拖拽文件无法工作的问题
  - 在 TitleBar.tsx 中添加了 `data-tauri-drag-region="false"` 属性
  - 添加了 `onDrop` 事件处理并调用 `e.preventDefault()` 和 `e.stopPropagation()`
  - 确保标题栏不会拦截拖拽事件

## [v1.0.7] - 2026-06-04

### Fixed

- **拖拽功能**: 彻底修复拖拽文件无法工作的问题
  - 改用原生 HTML5 拖拽 API，移除了 Tauri 窗口事件监听器
  - 在主容器上添加了完整的拖拽事件处理（onDrop、onDragOver、onDragLeave、onDragEnter）
  - 使用 useCallback 优化性能和依赖管理
  - 添加了 data-tauri-drag-region="false" 确保 Tauri 不会拦截拖拽事件
- **批量转换失败**: 修复 MP3 转 AC3 等格式时第二个文件失败的问题
  - 在 args_builder.rs 中修复了视频流处理逻辑，避免在没有视频流时尝试复制
  - 添加了 `-disposition:v attached_pic` 参数正确处理封面图片
  - 在 runner.rs 中修复了编译错误（添加了正确的错误处理）
  - 添加了 300 秒超时处理防止进程卡死
  - 改进了错误检测（添加了 "Invalid argument" 关键词）

### Changed

- 更新了 Layout.tsx，使用原生 HTML5 拖拽事件
- 更新了 args_builder.rs，改进了封面图片处理
- 更新了 runner.rs，添加超时处理和改进错误检测

## [v1.0.6] - 2026-06-04

### Fixed

- **拖拽功能**: 使用Tauri原生拖拽API重构
  - 添加了 `dragDropEnabled: true` 到 Tauri 窗口配置
  - 使用 `getCurrentWindow()` 的 `onDragEnterEvent`、`onDragLeaveEvent`、`onDragOverEvent`、`onDropEvent` 监听器
  - 正确处理拖拽文件路径，在 `onDropEvent` 中获取 `payload.paths`
  - 添加了详细的调试日志
  - 保留了视觉反馈效果（半透明遮罩 + 上传图标）
- **转换按钮逻辑**: 修复点击"开始转换"无反应的问题
  - 添加了 `handleStartConversion` 回调函数
  - 如果有待处理文件，直接开始转换
  - 如果没有待处理文件但有文件（已完成或失败），重置所有文件并开始转换
  - 使用 `useCallback` 优化性能
- **批量转换稳定性**: 修复多文件转换时第二个文件失败的问题
  - 在 `runner.rs` 中添加了 `is_complete` 标志跟踪进度状态
  - 如果没有看到 `progress=end`，仍然等待进程完成
  - 添加了 "Error while" 到错误检测关键词
  - 在 stderr 读取循环中添加了小延迟（1ms）防止CPU忙转
  - 改进了错误消息提取逻辑

### Changed

- 更新了 `tauri.conf.json`，添加 `dragDropEnabled: true` 配置
- 更新了 `runner.rs`，改进了进程管理和错误处理
- 更新了 `ConvertButton.tsx`，优化了转换逻辑

## [v1.0.5] - 2026-06-04

### Fixed

- **拖拽功能**: 完全重构拖拽处理机制
  - 使用 `dragCounter` 计数器防止拖拽状态闪烁问题
  - 添加了拖拽视觉反馈效果（半透明遮罩 + 上传图标 + 提示文本）
  - 在所有拖拽事件处理器中添加 `stopPropagation()` 防止事件冒泡
  - 简化为原生 HTML5 拖拽 API（移除了 react-dropzone 依赖）
- **转换按钮**: 优化转换按钮逻辑
  - 只要有文件存在就可以点击"开始转换"按钮
  - 添加了"重新转换"按钮，当文件已完成或失败时显示
  - 点击"重新转换"会将所有文件状态重置为待处理并开始转换
  - 添加了失败文件计数显示

### Added

- 新增翻译键：`conversion.reconvert`（重新转换）和 `fileList.failed`（失败）
- 拖拽时显示支持的文件类型提示

## [v1.0.4] - 2026-06-04

### Fixed

- **拖拽功能**: 使用 `react-dropzone` 库完全重构了拖拽功能，使用专业的拖拽处理机制
  - 完全替换了之前的原生 HTML 拖拽 API
  - 修正了 Tauri 权限配置
- **Tauri 权限**: 移除了不存在的 `core:window:allow-drag-drop` 权限
- **格式兼容性**: 确保所有 Rust 测试全部通过（20/20）

### Changed

- **输出格式调整**: 从 21 种格式减少为 16 种，以确保与 FFmpeg 8.1.1 essentials build 完全兼容
  - 移除的格式：aptX, SBC, TrueHD, MLP, DFPWM
  - 保留的格式：MP3, AAC, FLAC, WAV, M4A, OGG, Opus, ALAC, WMA, AC3, AIFF, E-AC3, DTS, MP2, WavPack, TTA
- **README.md**: 更新了功能特性描述，将格式数量从 21 种调整为 16 种

## [v1.0.3] - 2026-06-04

### Fixed

- **拖拽功能**: 修复了文件拖拽无法工作的问题
  - 在 `Layout.tsx` 中添加了完整的拖拽事件处理（onDrop、onDragOver、onDragLeave、onDragEnter）
  - 在 `TitleBar.tsx` 中添加了 `stopPropagation` 防止拖拽事件被拦截
  - 为工具栏、主内容区域和底部状态栏添加了 `data-tauri-drag-region="false"` 属性
- **选择文件夹功能**: 修复了无法识别文件夹内音频视频文件的问题
  - 添加了新的 `select_folder` 命令，支持选择文件夹并自动扫描其中的音频视频文件
- **格式转换错误**: 针对 FFmpeg 8.0.1 essentials build 优化了编码器配置
  - MP2: 使用原生 `mp2` 编码器（essentials build 支持）
  - aptX: 降级为 PCM WAV（aptX 编码器不在 essentials build 中）
  - TrueHD/MLP: 降级为 FLAC（这些编码器不在 essentials build 中）
  - DFPWM: 降级为 PCM WAV（DFPWM 编码器不在 essentials build 中）
  - 添加了 `format_flag` 字段支持特定格式输出

### Changed

- 更新了 `format_config.rs`，添加 `format_flag` 字段用于格式指定
- 更新了 `args_builder.rs`，支持 `-f` 格式标志
- 更新了 dialog API 使用异步回调模式替代阻塞模式
