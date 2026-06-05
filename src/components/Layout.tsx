import { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
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
import { Github, Upload, Languages } from "lucide-react";
import { ToastContainer } from "./Toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useSettingsStore } from "../stores/settingsStore";

const SUPPORTED_EXTENSIONS = [
  "mp3", "aac", "flac", "wav", "m4a", "ogg", "opus", "alac",
  "ac3", "aiff", "eac3", "mp2", "wv", "ape", "amr",
  "mid", "midi", "spx", "mp4", "mka", "mkv",
  "avi", "mov", "wmv", "flv", "webm",
];

const VIDEO_EXTENSIONS = ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"];

export function Layout() {
  const { status } = useFFmpeg();
  const { startConversion, cancelConversion } = useConversion();
  const isConverting = useConversionStore((s) => s.isConverting);
  const clearFiles = useConversionStore((s) => s.clearFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const isProcessingDrop = useRef(false);

  const { t } = useTranslation();
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Tauri v2 native drag-drop handler
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupDragDrop() {
      try {
        const appWindow = getCurrentWindow();
        unlisten = await appWindow.onDragDropEvent(async (event) => {
          const { type } = event.payload;
          
          if (type === "enter" || type === "over") {
            setIsDragOver(true);
          } else if (type === "leave") {
            setIsDragOver(false);
          } else if (type === "drop") {
            setIsDragOver(false);
            // Guard against duplicate drop events (race condition)
            if (isProcessingDrop.current) return;
            isProcessingDrop.current = true;
            
            const paths = event.payload.paths;
            
            if (paths.length > 0) {
              // Use getState to avoid stale closure / re-registration issues
              const { addFiles, files } = useConversionStore.getState();
              const existingPaths = new Set(files.map((f) => f.path));
              
              const newFiles = await Promise.all(
                paths
                  .filter((p) => {
                    const ext = p.split(".").pop()?.toLowerCase() || "";
                    return SUPPORTED_EXTENSIONS.includes(ext);
                  })
                  .filter((p) => !existingPaths.has(p)) // deduplicate
                  .map(async (p) => {
                    const name = p.split(/[\\/]/).pop() || p;
                    const extension = name.split(".").pop()?.toLowerCase() || "";
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
                      extension,
                      size,
                      isVideo: VIDEO_EXTENSIONS.includes(extension),
                      status: "pending" as const,
                      progress: 0,
                    };
                  })
              );
              
              if (newFiles.length > 0) {
                addFiles(newFiles);
              }
            }
            
            isProcessingDrop.current = false;
          }
        });
      } catch (e) {
        console.error("Failed to setup drag-drop:", e);
      }
    }

    setupDragDrop();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

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

  return (
    <div 
      className="flex h-screen flex-col bg-background text-foreground overflow-hidden"
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
        {/* Language Switcher */}
        <div className="relative group">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title={t("language.switch")}
          >
            <Languages size={15} />
          </button>
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 hidden min-w-[100px] rounded-md border border-border bg-card py-1 shadow-lg group-hover:block">
            <button
              onClick={() => {
                i18n.changeLanguage("zh");
                updateSetting("language", "zh");
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-secondary ${
                i18n.language === "zh" ? "text-primary font-medium" : "text-foreground"
              }`}
            >
              {t("language.zh")}
            </button>
            <button
              onClick={() => {
                i18n.changeLanguage("en");
                updateSetting("language", "en");
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-secondary ${
                i18n.language === "en" ? "text-primary font-medium" : "text-foreground"
              }`}
            >
              {t("language.en")}
            </button>
          </div>
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

      {/* Toast notifications - above status bar */}
      <ToastContainer />

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
