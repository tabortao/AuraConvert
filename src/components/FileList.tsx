import { useState, useEffect } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { FileItem } from "./FileItem";
import { TotalProgress } from "./ProgressBar";
import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FileList() {
  const files = useConversionStore((s) => s.files);
  const isConverting = useConversionStore((s) => s.isConverting);
  const clearFiles = useConversionStore((s) => s.clearFiles);
  const { t } = useTranslation();
  const [totalProgress, setTotalProgress] = useState({
    completed: 0,
    total: 0,
    eta: 0,
  });

  useEffect(() => {
    const completed = files.filter(
      (f) => f.status === "completed" || f.status === "failed"
    ).length;
    setTotalProgress({
      completed,
      total: files.length,
      eta: 0,
    });
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <Music size={48} className="mb-3 opacity-30" />
        <p className="text-sm">{t("fileList.empty")}</p>
        <p className="mt-1 text-xs opacity-60">
          {t("fileList.emptyHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("fileList.totalFiles", { count: files.length })}
        </span>
        {!isConverting && (
          <button
            onClick={clearFiles}
            className="text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            {t("fileList.clearList")}
          </button>
        )}
      </div>

      {/* Total Progress */}
      {isConverting && (
        <div className="mb-3">
          <TotalProgress
            completed={totalProgress.completed}
            total={totalProgress.total}
            eta={totalProgress.eta}
          />
        </div>
      )}

      {/* File List */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
