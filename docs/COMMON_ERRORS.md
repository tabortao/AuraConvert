# Common Errors & Lessons Learned

## Rust / Backend

### Codec & Encoder Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `[enc:libvorbis] Error while opening encoder - maybe incorrect parameters` | libvorbis 不兼容 `-b:a` + `-ar` + `-ac` 组合 | 改用 `-q:a` 质量模式编码 |
| `[enc:libopus] Error while opening encoder` | `libopus` 编码器参数要求严格 | 改用原生 `opus` 编码器 + `-strict -2` |
| `Experimental feature` | 原生 `opus` 编码器仍标记为实验性 | 添加 `-strict -2` 参数 |
| `Error sending frames to consumers` | AC3/E-AC3/DTS/Opus/MP2 编码器参数冲突 | 加入 `simple_formats` 列表，跳过 `-ar`/`-ac` |
| DTS/WMA/TTA 编码器不存在 | FFmpeg essentials build 不包含这些编码器 | 从输出格式中移除 |
| aptX/TrueHD/MLP/DFPWM 编码器不存在 | essentials build 不支持 | 降级为 PCM WAV/FLAC |

### Rust Compilation

| Error | Cause | Fix |
|-------|-------|-----|
| `lofty` traits not found | 缺少 `AudioFile`, `TaggedFileExt`, `Accessor` trait 导入 | 显式导入所需 trait |
| `base64::Engine` trait not found | 缺少 trait 导入 | `use base64::Engine` 然后 `STANDARD.encode()` |
| 临时值生命周期问题 | `format!` 临时值释放过早 | 使用 `let` 绑定延长生命周期 |
| `ConversionState` 未注入 | 忘记 `.manage()` 注册 | 在 `lib.rs` 中注册 state |
| 未使用的导入警告 | 导入了不必要的 crate | 移除 `tauri_plugin_store::StoreExt`, `serde_json::Value`, `HashMap`, `FsExt`, `ShellExt` |

### FFmpeg Runner

| Error | Cause | Fix |
|-------|-------|-----|
| 多文件转换第二个文件失败 | `FfmpegRunner` Clone 共享取消标志 | 确保 Clone 实现使用独立取消标志 |
| FFmpeg 进程弹出终端窗口 | 缺少 `CREATE_NO_WINDOW` 标志 | Windows 平台添加 `CREATE_NO_WINDOW` |

## Frontend / TypeScript

### Tauri API

| Error | Cause | Fix |
|-------|-------|-----|
| `Property 'paths' does not exist on type 'DragDropEvent'` | `DragDropEvent` 是联合类型，`paths` 仅存在于 `enter`/`drop` | 先用 `type` 收窄类型再访问 `paths` |
| 拖拽文件无法添加 | Tauri v2 中 HTML5 拖拽事件不触发 | 使用 `getCurrentWindow().onDragDropEvent()` |
| 打开文件夹无反应 | `@tauri-apps/plugin-shell` 的 `open` 未能打开 Windows 路径 | 使用 Rust 命令 `std::process::Command::new("explorer")` |
| 拖拽文件列表显示重复 | `onDragDropEvent` drop 事件竞态，两个事件同时处理 | 使用 `useRef` 作为防重入锁 |
| `FilePath` 类型转换 | `to_string_lossy()` 不存在 | 使用 `to_string()` |
| `blocking_pick_files()` 返回值 | 返回 `Option<Vec<FilePath>>` 而非元组 | 直接解包 Option |

### File Size

| Error | Cause | Fix |
|-------|-------|-----|
| 文件大小显示为 0 或 "-" | 拖拽添加时未获取文件大小，`size: 0` 硬编码 | 通过 `invoke("get_file_metadata")` 获取真实文件大小 |
| `std::fs::metadata` 在 Tauri 中受限 | Tauri fs scope 限制 | 使用 Tauri command `get_file_metadata` 替代 |

## Build & Configuration

| Error | Cause | Fix |
|-------|-------|-----|
| `beforeBuildCommand` 失败 | TypeScript 编译错误 | 先修复 TS 错误再构建 |
| macOS bundle identifier 错误 | 以 `.app` 结尾 | 使用 `com.auraconvert` 格式 |
| Tauri bundle 生成多余平台包 | targets 配置包含多余平台 | 设置 `targets: ["nsis"]` |

## Conversion Best Practices

1. **严格编码器格式** (AC3, E-AC3, Opus, MP2): 使用最小化命令，不强制 `-ar`/`-ac`，让 FFmpeg 自动处理
2. **OGG (libvorbis)**: 使用 `-q:a` 质量模式（VBR），不强制采样率/声道
3. **M4A**: 需要 `-f ipod` 格式标志
4. **Opus**: 使用原生 `opus` 编码器 + `-strict -2`
5. **MP2**: 使用原生 `mp2` 编码器
6. **视频文件**: 添加 `-vn` 跳过视频流，保留封面图用 `-disposition:v attached_pic`