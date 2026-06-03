import type { AudioInfo } from "../types";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AudioInfoDialogProps {
  info: AudioInfo | null;
  onClose: () => void;
}

export function AudioInfoDialog({ info, onClose }: AudioInfoDialogProps) {
  const { t } = useTranslation();
  if (!info) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-xl bg-card p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("audioInfo.title")}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        {/* Cover Art */}
        {info.coverArt && (
          <div className="mb-3 flex justify-center">
            <img
              src={info.coverArt}
              alt="Cover"
              className="h-32 w-32 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {info.title && (
            <InfoRow label={t("audioInfo.titleField")} value={info.title} />
          )}
          {info.artist && (
            <InfoRow label={t("audioInfo.artist")} value={info.artist} />
          )}
          {info.album && (
            <InfoRow label={t("audioInfo.album")} value={info.album} />
          )}
          {info.year && (
            <InfoRow label={t("audioInfo.year")} value={info.year.toString()} />
          )}
          {info.genre && (
            <InfoRow label={t("audioInfo.genre")} value={info.genre} />
          )}
          <InfoRow label={t("audioInfo.format")} value={info.format} />
          <InfoRow label={t("audioInfo.bitrate")} value={`${info.bitrate / 1000} kbps`} />
          <InfoRow label={t("audioInfo.sampleRate")} value={`${info.sampleRate} Hz`} />
          <InfoRow label={t("audioInfo.channels")} value={info.channels.toString()} />
          {info.bitDepth && (
            <InfoRow label={t("audioInfo.bitDepth")} value={`${info.bitDepth} bit`} />
          )}
          <InfoRow label={t("audioInfo.duration")} value={formatDuration(info.duration)} />
          <InfoRow label={t("audioInfo.fileSize")} value={formatFileSize(info.fileSize)} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
