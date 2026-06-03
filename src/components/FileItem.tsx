import { useState } from "react";
import { useAudioInfo } from "../hooks/useAudioInfo";
import { formatFileSize, formatDuration } from "../utils/fileUtils";
import { CheckCircle, XCircle, Loader2, Info, Music, Clock, HardDrive, Disc, Mic2, Tag } from "lucide-react";
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
        <div className="mt-1 rounded-lg bg-secondary/50 p-2.5">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              {t("audioInfo.loading")}
            </div>
          ) : info ? (
            <div className="flex flex-col gap-1.5 text-xs">
              {/* Row 1: format · bitrate · channels · sample rate · duration · file size */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded bg-background/60 px-1.5 py-0.5 font-medium text-foreground">
                  <Disc size={11} className="text-primary" />
                  {info.format}
                </span>
                {info.bitrate > 0 && (
                  <span>{Math.round(info.bitrate / 1000)} kbps</span>
                )}
                {info.sampleRate > 0 && (
                  <span>{info.sampleRate / 1000} kHz</span>
                )}
                {info.channels > 0 && (
                  <span>{info.channels === 1 ? "单声道" : "立体声"}</span>
                )}
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
              </div>

              {/* Row 2: title · artist · album · year · genre + cover */}
              <div className="flex items-center gap-x-3 gap-y-0.5 text-muted-foreground">
                {info.title && (
                  <span className="truncate max-w-[160px] font-medium text-foreground" title={info.title}>
                    {info.title}
                  </span>
                )}
                {info.artist && (
                  <span className="truncate max-w-[120px]" title={info.artist}>
                    <Mic2 size={11} className="inline -mt-px mr-0.5" />
                    {info.artist}
                  </span>
                )}
                {info.album && (
                  <span className="truncate max-w-[120px]" title={info.album}>
                    {info.album}
                  </span>
                )}
                {info.year && (
                  <span>{info.year}</span>
                )}
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
                    className="ml-auto h-8 w-8 rounded object-cover flex-shrink-0"
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">无法读取音频信息</p>
          )}
        </div>
      )}
    </div>
  );
}
