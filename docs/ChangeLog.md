# Change Log

All notable changes to AuraConvert will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic version tags.

## [v1.1.6] - 2026-06-04

### Added

- **Toast 通知**: 每批转换显示汇总提示，包含完成/失败数量和总耗时
- **文件操作按钮**: 转换完成后可删除文件、打开文件所在文件夹
- **文件大小显示**: 修复拖拽/选择文件时文件大小显示为 0 的问题
- **Rust 打开文件夹命令**: 新增 `open_folder` 命令，使用 `explorer` 打开文件夹

### Changed

- **版本号同步**: `tauri.conf.json` 和 TitleBar 版本号统一为 `v1.1.6`
- **输出格式精简**: 根据 FFmpeg 8.1.1 essentials build，移除不支持格式 (DTS/WMA/TTA)，从 16 种减少为 **13 种**
- **Opus 编码器**: 从 `libopus` 改为原生 `opus` 编码器 + `-strict -2`
- **Toast 位置**: 从右下角改为状态栏上方

### Fixed

- **拖拽功能**: 使用 Tauri v2 原生 `onDragDropEvent` API 替代 HTML5 拖拽事件
- **拖拽重复文件**: 添加 `useRef` 防重入锁，避免 drop 事件竞态导致文件重复添加
- **拖拽类型错误**: 修复 `DragDropEvent` 联合类型中 `paths` 属性访问问题
- **OGG/Vorbis 编码错误**: libvorbis 改用 `-q:a` 质量模式编码，避免 `-b:a` + `-ar`/`-ac` 参数冲突
- **Opus 实验性功能**: 添加 `-strict -2` 参数启用原生 `opus` 编码器
- **AC3/E-AC3/MP2 编码错误**: 加入 `simple_formats` 列表，跳过 `-ar`/`-ac` 强制参数
- **批量转换**: 修复多文件转换时第二个文件失败的问题 (FfmpegRunner Clone 独立取消标志)
- **文件选择**: 添加 `select_folder` 和 `get_file_metadata` 命令
- **打开文件夹**: 修复 `open_folder` 按钮无反应，改用 Rust 原生 `explorer` 命令替代 `@tauri-apps/plugin-shell` 的 `open`
- **多语言支持**: 添加语言切换器（工具栏 GitHub 图标左侧），自动检测系统语言，支持中文/英文切换
- **README 多语言**: 新增 `README.md`（英文版）和 `README.zh-CN.md`（中文版），互相链接

## [v1.0.2] - 2026-06-03

### Fixed

- 音频信息显示文件大小为 0 的问题
- 音频信息布局优化，改为两列显示

## [v1.0.1] - 2026-06-03

### Fixed

- Rust 编译错误 (lofty/base64 导入、AppHandle 使用、std::fs::metadata 替换)
- 文件选择后文件大小显示为 0

## [v1.0.0] - 2026-06-02

### Added

- 初始版本发布
- 支持 13 种输出格式的音频转换
- 批量转换、实时进度跟踪
- 视频文件音频提取
- 深色主题 UI (Spotify 风格)
- 中英文国际化
- FFmpeg 自动检测与手动配置
- 音频元数据读取 (lofty + ffprobe)
- 智能参数优化

[Unreleased]: https://github.com/tabortao/AuraConvert/compare/v1.1.6...HEAD
[v1.1.6]: https://github.com/tabortao/AuraConvert/compare/v1.0.2...v1.1.6
[v1.0.2]: https://github.com/tabortao/AuraConvert/compare/v1.0.1...v1.0.2
[v1.0.1]: https://github.com/tabortao/AuraConvert/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/tabortao/AuraConvert/releases/tag/v1.0.0