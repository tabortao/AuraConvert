import { useState } from "react";
import { useAudioInfo } from "../hooks/useAudioInfo";
import { formatFileSize, formatDuration } from "../utils/fileUtils";
import { CheckCircle, XCircle, Loader2, Info, Music, Clock, HardDrive, Disc, Mic2, Calendar, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FileItemProps {
  file: import("../types").AudioFile;
}

export function FileItem({ file }: FileItemProps) {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const { info, loading, fetchInfo } = useAudioInfo();

  const handleShowInfo = async () => {
    if (!info && !loading) {
      await fetchInfo(file.path);
    }
    setShowInfo(!showInfo);
  };

  const statusIcon = () => {
    switch (file.status) {
      case "completed":
        return <CheckCircle size={16} className="text-primary" />;
      case "failed":
        return <XCircle size={16} className="text-destructive" />;
      case "converting":
        return <Loader2 size={16} className="animate-spin text-primary" />;
      default:
        return <Music size={16} className="text-muted-foreground" />;
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
        return formatFileSize(file.size);
    }
  };

  // Use file.size as fallback when info.fileSize is 0
  const displayFileSize = info?.fileSize && info.fileSize > 0 ? info.fileSize : file.size;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        {statusIcon()}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">{statusText()}</p>
        </div>
        <button
          onClick={handleShowInfo}
          className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <Info size={12} />
          {t("fileItem.showInfo")}
        </button>
      </div>

      {file.status === "converting" && file.progress > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${file.progress}%` }}
          />
        </div>
      )}

      {showInfo && (
        <div className="mt-1 rounded-lg bg-secondary/50 p-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              {t("audioInfo.loading")}
            </div>
          ) : info ? (
            <div className="flex flex-col gap-2 text-xs">
              {/* Top row: format + bitrate + channels */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1">
                  <Disc size={12} className="text-primary" />
                  <span className="font-medium">{info.format}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{info.bitrate > 0 ? `${Math.round(info.bitrate / 1000)} kbps` : "-"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {info.channels > 0 ? (info.channels === 1 ? "单声道" : "立体声") : "-"}
                  </span>
                </div>
              </div>

              {/* Second row: duration + file size */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  <span>{formatDuration(info.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive size={12} className="text-muted-foreground" />
                  <span>{formatFileSize(displayFileSize)}</span>
                </div>
              </div>

              {/* Metadata section */}
              {(info.title || info.artist || info.album) && (
                <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2">
                  {info.title && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">标题:</span>
                      <span className="font-medium">{info.title}</span>
                    </div>
                  )}
                  {info.artist && (
                    <div className="flex items-center gap-1.5">
                      <Mic2 size={12} className="text-muted-foreground" />
                      <span className="font-medium">{info.artist}</span>
                    </div>
                  )}
                  {info.album && (
                    <div className="flex items-center gap-1.5">
                      <Disc size={12} className="text-muted-foreground" />
                      <span className="font-medium">{info.album}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4">
                    {info.year && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span>{info.year}</span>
                      </div>
                    )}
                    {info.genre && (
                      <div className="flex items-center gap-1">
                        <Tag size={12} className="text-muted-foreground" />
                        <span>{info.genre}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cover art */}
              {info.coverArt && (
                <div className="flex justify-center pt-1">
                  <img
                    src={info.coverArt}
                    alt="Cover"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </div>
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
