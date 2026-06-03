import { useState } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { invoke } from "@tauri-apps/api/core";
import { FolderOpen, FilePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DropZone() {
  const addFiles = useConversionStore((s) => s.addFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useTranslation();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(
        files.map((f) => ({
          id: crypto.randomUUID(),
          path: (f as any).path || f.name,
          name: f.name,
          extension: f.name.split(".").pop()?.toLowerCase() || "",
          size: f.size,
          isVideo: false,
          status: "pending" as const,
          progress: 0,
        }))
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSelectFiles = async () => {
    const selected = await invoke<string[]>("select_files");
    if (selected && selected.length > 0) {
      addFiles(
        selected.map((p) => {
          const name = p.split(/[\\/]/).pop() || p;
          return {
            id: crypto.randomUUID(),
            path: p,
            name,
            extension: name.split(".").pop()?.toLowerCase() || "",
            size: 0,
            isVideo: false,
            status: "pending" as const,
            progress: 0,
          };
        })
      );
    }
  };

  const handleSelectFolder = async () => {
    const selected = await invoke<string | null>("select_output_dir");
    if (selected) {
      // Folder scanning will be implemented in Phase 3
      console.log("Selected folder:", selected);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
        isDragOver
          ? "border-primary bg-primary/10"
          : "border-border hover:border-muted-foreground/50"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <FolderOpen size={20} />
        <span className="text-sm">
          {t("dropzone.title")}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSelectFiles}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <FilePlus size={14} />
          {t("dropzone.selectFiles")}
        </button>
        <button
          onClick={handleSelectFolder}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <FolderOpen size={14} />
          {t("dropzone.selectFolder")}
        </button>
      </div>
    </div>
  );
}