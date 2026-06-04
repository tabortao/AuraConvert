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

export function Layout() {
  const { status } = useFFmpeg();
  const { startConversion, cancelConversion } = useConversion();
  const isConverting = useConversionStore((s) => s.isConverting);
  const clearFiles = useConversionStore((s) => s.clearFiles);

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
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Custom Title Bar - purple gradient */}
      <TitleBar />

      {/* Toolbar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
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
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Center: File List */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <FileList />
        </div>

        {/* Right Sidebar - Settings */}
        <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-border bg-sidebar">
          <SettingsPanel />
        </aside>
      </main>

      {/* Bottom Status Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-t border-border bg-card px-4">
        <ConvertButton />
      </div>
    </div>
  );
}
