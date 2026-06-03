import { TitleBar } from "./TitleBar";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsPanel } from "./SettingsPanel";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { ConvertButton } from "./ConvertButton";
import { useFFmpeg } from "../hooks/useFFmpeg";
import { useConversion } from "../hooks/useConversion";
import { useConversionStore } from "../stores/conversionStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function Layout() {
  const { status } = useFFmpeg();
  const { t } = useTranslation();
  const { startConversion, cancelConversion } = useConversion();
  const isConverting = useConversionStore((s) => s.isConverting);
  const clearFiles = useConversionStore((s) => s.clearFiles);

  // Keyboard shortcuts
  const shortcuts = useMemo(
    () => [
      {
        key: "o",
        ctrl: true,
        handler: () => {
          // Ctrl+O: Open file dialog (handled by DropZone)
        },
        description: "Open files",
      },
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
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden rounded-lg">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* App Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20">
            <span className="text-sm">🎵</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              AuraConvert
            </span>
            <span className="text-[11px] text-muted-foreground">v1.0.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* FFmpeg Status Indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              status?.found
                ? "bg-primary/15 text-primary"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                status?.found ? "bg-primary" : "bg-destructive"
              }`}
            />
            {t("ffmpeg.ok")}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Settings */}
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border">
          <SettingsPanel />
        </aside>

        {/* Right - Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Drop Zone */}
          <div className="shrink-0 p-4">
            <DropZone />
          </div>

          {/* File List */}
          <div className="flex-1 overflow-hidden px-4">
            <FileList />
          </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 border-t border-border p-4">
            <ConvertButton />
          </div>
        </div>
      </main>
    </div>
  );
}
