import { useState, useCallback } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { useFFmpeg } from "../hooks/useFFmpeg";
import { useConversion } from "../hooks/useConversion";
import { Play, Square, FolderOutput, RotateCcw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

export function ConvertButton() {
  const files = useConversionStore((s) => s.files);
  const isConverting = useConversionStore((s) => s.isConverting);
  const canCancel = useConversionStore((s) => s.canCancel);
  const { status: ffmpegStatus } = useFFmpeg();
  const { startConversion, cancelConversion } = useConversion();
  const { t } = useTranslation();
  const [outputDir, setOutputDir] = useState<string | null>(null);

  const pendingFiles = files.filter((f) => f.status === "pending");
  const completedFiles = files.filter((f) => f.status === "completed");
  const failedFiles = files.filter((f) => f.status === "failed");
  
  // 允许开始转换的条件：有待处理文件或失败文件，或已有文件（允许重新转换）
  const canStart = files.length > 0 && !isConverting && ffmpegStatus?.found;

  const handleSelectDir = async () => {
    const dir = await invoke<string | null>("select_output_dir");
    if (dir) {
      setOutputDir(dir);
    }
  };

  const handleReconvert = useCallback(() => {
    // 将所有文件状态重置为 pending
    const store = useConversionStore.getState();
    store.files.forEach((f) => {
      store.updateFile(f.id, {
        status: "pending",
        progress: 0,
        error: undefined,
        outputPath: undefined,
        outputSize: undefined,
        compressionRatio: undefined,
      });
    });
    // 开始转换
    startConversion();
  }, [startConversion]);

  const handleStartConversion = useCallback(() => {
    // 如果有待处理文件，直接开始转换
    if (pendingFiles.length > 0) {
      startConversion();
    } else if (files.length > 0) {
      // 如果没有待处理文件但有文件（已完成或失败），重置所有文件并开始转换
      handleReconvert();
    }
  }, [pendingFiles, files, startConversion, handleReconvert]);

  return (
    <div className="flex w-full items-center justify-between">
      {/* Left: Stats */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        {files.length > 0 && (
          <>
            <span>
              <span className="font-medium text-foreground">{completedFiles.length}</span>
              {" / "}
              {files.length} {t("fileList.completed")}
            </span>
            {pendingFiles.length > 0 && (
              <span>
                {pendingFiles.length} {t("fileList.pending")}
              </span>
            )}
            {failedFiles.length > 0 && (
              <span className="text-destructive">
                {failedFiles.length} {t("fileList.failed")}
              </span>
            )}
          </>
        )}
      </div>

      {/* Right: Output dir + Convert */}
      <div className="flex items-center gap-3">
        {/* Output directory selector */}
        <button
          onClick={handleSelectDir}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <FolderOutput size={14} />
          <span className="max-w-[180px] truncate">
            {outputDir
              ? outputDir.split(/[\\/]/).pop()
              : t("settings.sameAsSource")}
          </span>
        </button>

        {isConverting ? (
          <button
            onClick={cancelConversion}
            disabled={!canCancel}
            className="flex items-center gap-1.5 rounded-full bg-destructive px-5 py-2 text-[12px] font-medium text-white shadow-sm transition-all hover:bg-destructive/90 hover:shadow disabled:opacity-50"
          >
            <Square size={14} />
            {t("conversion.cancel")}
          </button>
        ) : (
          <>
            {/* 重新转换按钮（当有已完成或失败的文件时显示） */}
            {(completedFiles.length > 0 || failedFiles.length > 0) && files.length > 0 && (
              <button
                onClick={handleReconvert}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[12px] font-medium text-foreground shadow-sm transition-all hover:bg-secondary/80 hover:shadow"
              >
                <RotateCcw size={14} />
                {t("conversion.reconvert")}
              </button>
            )}
            {/* 开始转换按钮 */}
            <button
              onClick={handleStartConversion}
              disabled={!canStart}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-5 py-2 text-[12px] font-medium text-white shadow-sm transition-all hover:from-[#2563eb] hover:to-[#1d4ed8] hover:shadow disabled:opacity-50"
            >
              <Play size={14} />
              {t("conversion.start")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
