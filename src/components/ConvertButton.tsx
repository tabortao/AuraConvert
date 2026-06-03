import { useConversionStore } from "../stores/conversionStore";
import { useFFmpeg } from "../hooks/useFFmpeg";
import { useConversion } from "../hooks/useConversion";
import { Play, Square, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ConvertButton() {
  const files = useConversionStore((s) => s.files);
  const isConverting = useConversionStore((s) => s.isConverting);
  const canCancel = useConversionStore((s) => s.canCancel);
  const clearFiles = useConversionStore((s) => s.clearFiles);
  const { status: ffmpegStatus } = useFFmpeg();
  const { startConversion, cancelConversion } = useConversion();
  const { t } = useTranslation();

  const pendingFiles = files.filter((f) => f.status === "pending");
  const completedFiles = files.filter((f) => f.status === "completed");
  const canStart = pendingFiles.length > 0 && !isConverting && ffmpegStatus?.found;

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-muted-foreground">
        {files.length > 0 && (
          <span>
            {completedFiles.length} / {files.length} {t("fileList.completed")}
            {pendingFiles.length > 0 && ` · ${pendingFiles.length} ${t("fileList.pending")}`}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {!isConverting && files.length > 0 && (
          <button
            onClick={clearFiles}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Trash2 size={16} />
            {t("conversion.clear")}
          </button>
        )}
        {isConverting ? (
          <button
            onClick={cancelConversion}
            disabled={!canCancel}
            className="flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            <Square size={16} />
            {t("conversion.cancel")}
          </button>
        ) : (
          <button
            onClick={startConversion}
            disabled={!canStart}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Play size={16} />
            {t("conversion.start")}
          </button>
        )}
      </div>
    </div>
  );
}
