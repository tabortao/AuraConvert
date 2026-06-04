import { useState, useEffect } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { FileItem } from "./FileItem";
import { TotalProgress } from "./ProgressBar";
import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FileList() {
  const files = useConversionStore((s) => s.files);
  const isConverting = useConversionStore((s) => s.isConverting);
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
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Music size={32} className="text-primary/60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {t("fileList.empty")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t("fileList.emptyHint")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Table Header */}
      <div className="flex shrink-0 items-center border-b border-border bg-card/50 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="w-8 text-center">#</div>
        <div className="flex-1 min-w-0">{t("fileList.fileName")}</div>
        <div className="w-16 text-center">{t("fileList.format")}</div>
        <div className="w-20 text-right">{t("fileList.size")}</div>
        <div className="w-20 text-right">{t("fileList.duration")}</div>
        <div className="w-24 text-center">{t("fileList.status")}</div>
        <div className="w-16 text-center">{t("fileList.actions")}</div>
      </div>

      {/* Total Progress */}
      {isConverting && (
        <div className="mx-4 mt-2">
          <TotalProgress
            completed={totalProgress.completed}
            total={totalProgress.total}
            eta={totalProgress.eta}
          />
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {files.map((file, index) => (
          <FileItem key={file.id} file={file} index={index} />
        ))}
      </div>
    </div>
  );
}
