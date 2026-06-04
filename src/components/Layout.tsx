import { useState, useEffect, useCallback } from "react";
import { TitleBar } from "./TitleBar";
import { SettingsPanel } from "./SettingsPanel";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { ConvertButton } from "./ConvertButton";
import { useFFmpeg } from "../hooks/useFFmpeg";
import { useConversion } from "../hooks/useConversion";
import { useConversionStore } from "../stores/conversionStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useMemo } from "react";
import { Github } from "lucide-react";
import { Upload } from "lucide-react";

export function Layout() {
  const { status } = useFFmpeg();
  const { startConversion, cancelConversion } = useConversion();
  const isConverting = useConversionStore((s) => s.isConverting);
  const clearFiles = useConversionStore((s) => s.clearFiles);
  const addFiles = useConversionStore((s) => s.addFiles);
  const [isDragOver, setIsDragOver] = useState(false);

  const shortcuts = useMemo(
    () => [
      {
        key: "Enter",
        ctrl: true,
        handler: () => {
          if (isConverting) cancelConversion();
          else startConversion();
        },
        description: "Start/Cancel conversion",
      },
      {
        key: "Delete",
        handler: () => {
          if (!isConverting) clearFiles();
        },
        description: "Clear files",
      },
    ],
    [isConverting, startConversion, cancelConversion, clearFiles]
  );
  useKeyboardShortcuts(shortcuts);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map((f) => {
        const name = f.name;
        const extension = name.split(".").pop()?.toLowerCase() || "";
        return {
          id: crypto.randomUUID(),
          path: (f as any).path || name,
          name,
          extension,
          size: f.size,
          isVideo: ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"].includes(extension),
          status: "pending" as const,
          progress: 0,
        };
      });
      addFiles(newFiles);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  return (
    <div 
      className="flex h-screen flex-col bg-background text-foreground overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
    >
      {/* Custom Title Bar - purple gradient */}
      <TitleBar />

      {/* Toolbar */}
      <div 
        className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-card px-4"
        data-tauri-drag-region="false"
      >
        <DropZone />
        <div className="flex-1" />
        {/* FFmpeg Status */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            status?.found
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              status?.found ? "bg-primary" : "bg-destructive"
            }`}
          />
          FFmpeg {status?.found ? "✓" : "✗"}
        </div>
        {/* GitHub Link */}
        <a
          href="https://github.com/tabortao/AuraConvert"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="GitHub"
        >
          <Github size={15} />
        </a>
      </div>

      {/* Main Content */}
      <main
        className={`relative flex flex-1 overflow-hidden transition-all duration-200 ${
          isDragOver ? "bg-primary/5" : ""
        }`}
        data-tauri-drag-region="false"
      >
        {/* Center: File List */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <FileList />
        </div>

        {/* Right Sidebar - Settings */}
        <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-border bg-sidebar">
          <SettingsPanel />
        </aside>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary bg-background/80 p-12 shadow-2xl">
              <Upload size={64} className="text-primary animate-bounce" />
              <p className="text-2xl font-bold text-primary">释放文件以添加</p>
              <p className="text-sm text-muted-foreground">
                支持音频文件：MP3、WAV、FLAC、AAC、OGG 等
              </p>
              <p className="text-sm text-muted-foreground">
                支持视频文件：MP4、MKV、AVI、MOV 等
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <div 
        className="flex h-12 shrink-0 items-center justify-between border-t border-border bg-card px-4"
        data-tauri-drag-region="false"
      >
        <ConvertButton />
      </div>
    </div>
  );
}
