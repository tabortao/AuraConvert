import { useState } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { invoke } from "@tauri-apps/api/core";
import { FolderOpen, FilePlus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DropZone() {
  const addFiles = useConversionStore((s) => s.addFiles);
  const clearFiles = useConversionStore((s) => s.clearFiles);
  const files = useConversionStore((s) => s.files);
  const isConverting = useConversionStore((s) => s.isConverting);
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useTranslation();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(
        droppedFiles.map((f) => ({
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
      const filesWithSize = await Promise.all(
        selected.map(async (p) => {
          const name = p.split(/[\\/]/).pop() || p;
          let size = 0;
          try {
            const meta = await invoke<{ size: number }>("get_file_metadata", { path: p });
            size = meta.size;
          } catch {
            // fallback
          }
          return {
            id: crypto.randomUUID(),
            path: p,
            name,
            extension: name.split(".").pop()?.toLowerCase() || "",
            size,
            isVideo: false,
            status: "pending" as const,
            progress: 0,
          };
        })
      );
      addFiles(filesWithSize);
    }
  };

  const handleSelectFolder = async () => {
    const selected = await invoke<string | null>("select_output_dir");
    if (selected) {
      console.log("Selected folder:", selected);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex items-center gap-2 rounded-lg transition-all ${
        isDragOver ? "bg-primary/5 ring-1 ring-primary/30" : ""
      }`}
    >
      <button
        onClick={handleSelectFiles}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground shadow-sm transition-all hover:bg-secondary hover:shadow"
      >
        <FilePlus size={14} className="text-primary" />
        {t("dropzone.selectFiles")}
      </button>
      <button
        onClick={handleSelectFolder}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground shadow-sm transition-all hover:bg-secondary hover:shadow"
      >
        <FolderOpen size={14} className="text-primary" />
        {t("dropzone.selectFolder")}
      </button>
      {!isConverting && files.length > 0 && (
        <button
          onClick={clearFiles}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-destructive shadow-sm transition-all hover:bg-destructive/5 hover:shadow"
        >
          <Trash2 size={14} />
          {t("fileList.clearList")}
        </button>
      )}
    </div>
  );
}
