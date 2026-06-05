import { useState } from "react";
import { useAudioInfo } from "../hooks/useAudioInfo";
import { useConversionStore } from "../stores/conversionStore";
import { formatFileSize, formatDuration } from "../utils/fileUtils";
import { invoke } from "@tauri-apps/api/core";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Music,
  Clock,
  HardDrive,
  Disc,
  Mic2,
  Tag,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FileItemProps {
  file: import("../types").AudioFile;
  index?: number;
}

export function FileItem({ file, index }: FileItemProps) {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const { info, loading, fetchInfo } = useAudioInfo();
  const removeFile = useConversionStore((s) => s.removeFile);
  const isConverting = useConversionStore((s) => s.isConverting);

  const handleShowInfo = async () => {
    if (!info && !loading) {
      await fetchInfo(file.path);
    }
    setShowInfo(!showInfo);
  };

  const handleDelete = () => {
    removeFile(file.id);
  };

  const handleOpenFolder = async () => {
    try {
      const path = file.outputPath || file.path;
      await invoke("open_folder", { path });
    } catch (e) {
      console.error("Failed to open folder:", e);
    }
  };

  const statusIcon = () => {
    switch (file.status) {
      case "completed":
        return <CheckCircle size={14} className="text-primary" />;
      case "failed":
        return <XCircle size={14} className="text-destructive" />;
      case "converting":
        return <Loader2 size={14} className="animate-spin text-primary" />;
      default:
        return <Music size={14} className="text-muted-foreground/50" />;
    }
  };

  const statusText = () => {
    switch (file.status) {
      case "completed":
        if (file.compressionRatio !== undefined) {
          const ratio = file.compressionRatio;
          if (ratio < 1) {
            return t("fileItem.compress", { percent: Math.round((1 - ratio) * 100) });
          } else if (ratio > 1) {
            return t("fileItem.expand", { percent: Math.round((ratio - 1) * 100) });
          }
        }
        return t("progress.completed");
      case "failed":
        return file.error || t("progress.failed");
      case "converting":
        return `${file.progress.toFixed(1)}%`;
      default:
        return "等待中";
    }
  };

  const displayFileSize = info?.fileSize && info.fileSize > 0 ? info.fileSize : file.size;

  return (
    <div className="flex flex-col border-b border-border/50 last:border-b-0">
      {/* Main Row */}
      <div className="flex items-center px-4 py-2.5 text-[12px] transition-colors hover:bg-card/80">
        <div className="w-8 text-center text-muted-foreground/50">
          {index !== undefined ? index + 1 : ""}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {statusIcon()}
          <span className="truncate font-medium text-foreground">{file.name}</span>
        </div>
        <div className="w-16 text-center text-muted-foreground">
          {file.extension.toUpperCase()}
        </div>
        <div className="w-20 text-right text-muted-foreground">
          {displayFileSize > 0 ? formatFileSize(displayFileSize) : "-"}
        </div>
        <div className="w-20 text-right text-muted-foreground">
          {info?.duration && info.duration > 0
            ? formatDuration(info.duration)
            : "-"}
        </div>
        <div className="w-24 text-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              file.status === "completed"
                ? "bg-primary/10 text-primary"
                : file.status === "failed"
                  ? "bg-destructive/10 text-destructive"
                  : file.status === "converting"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
            }`}
          >
            {statusText()}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Open folder - for completed files */}
          {file.status === "completed" && (
            <button
              onClick={handleOpenFolder}
              className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="打开文件夹"
            >
              <FolderOpen size={13} />
            </button>
          )}
          {/* Delete - only when not converting */}
          {!isConverting && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="删除"
            >
              <Trash2 size={13} />
            </button>
          )}
          {/* Info */}
          <button
            onClick={handleShowInfo}
            className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Info size={13} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {file.status === "converting" && file.progress > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio Info Panel */}
      {showInfo && (
        <div className="border-t border-border/50 bg-card/50 px-4 py-2.5">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              {t("audioInfo.loading")}
            </div>
          ) : info ? (
            <div className="flex items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                <Disc size={11} />
                {info.format}
              </span>
              {info.bitrate > 0 && <span>{Math.round(info.bitrate / 1000)} kbps</span>}
              {info.sampleRate > 0 && <span>{info.sampleRate / 1000} kHz</span>}
              {info.channels > 0 && <span>{info.channels === 1 ? "单声道" : "立体声"}</span>}
              {info.duration > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {formatDuration(info.duration)}
                </span>
              )}
              {displayFileSize > 0 && (
                <span className="inline-flex items-center gap-1">
                  <HardDrive size={11} />
                  {formatFileSize(displayFileSize)}
                </span>
              )}
              {info.title && (
                <span className="truncate max-w-[120px] font-medium text-foreground" title={info.title}>
                  {info.title}
                </span>
              )}
              {info.artist && (
                <span className="truncate max-w-[100px]" title={info.artist}>
                  <Mic2 size={11} className="inline -mt-px mr-0.5" />
                  {info.artist}
                </span>
              )}
              {info.album && (
                <span className="truncate max-w-[100px]" title={info.album}>
                  {info.album}
                </span>
              )}
              {info.year && <span>{info.year}</span>}
              {info.genre && (
                <span>
                  <Tag size={11} className="inline -mt-px mr-0.5" />
                  {info.genre}
                </span>
              )}
              {info.coverArt && (
                <img
                  src={info.coverArt}
                  alt="Cover"
                  className="ml-auto h-7 w-7 rounded object-cover flex-shrink-0"
                />
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">无法读取音频信息</p>
          )}
        </div>
      )}
    </div>
  );
}
