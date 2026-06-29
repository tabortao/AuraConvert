import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSettingsStore } from "../stores/settingsStore";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const theme = useSettingsStore((s) => s.theme);

  const handleMinimize = async () => {
    await invoke("minimize_window");
  };

  const handleMaximize = async () => {
    await invoke("maximize_window");
    setIsMaximized((prev) => !prev);
  };

  const handleClose = async () => {
    await invoke("close_window");
  };

  const isDark = theme === "dark";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      data-tauri-drag-region="false"
      className={`flex h-10 shrink-0 items-center justify-between select-none ${
        isDark
          ? "bg-[#1a1a1a]"
          : "bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"
      }`}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Left: App title */}
      <div className="flex items-center gap-2.5 px-4">
        <img
          src="/icon.png"
          alt="AuraConvert"
          className="h-5 w-5 rounded-sm"
          draggable={false}
        />
        <span className={`text-[13px] font-medium ${isDark ? "text-white/70" : "text-white/90"}`}>
          AuraConvert
        </span>
        <span className={`text-[11px] ${isDark ? "text-white/30" : "text-white/50"}`}>v1.1.8</span>
      </div>

      {/* Right: Theme toggle + Window controls */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <ThemeToggle light={isDark} />
        <button
          onClick={handleMinimize}
          className={`flex h-10 w-[46px] items-center justify-center transition-colors ${
            isDark ? "text-white/50 hover:bg-white/10 hover:text-white/80" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          title="最小化"
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleMaximize}
          className={`flex h-10 w-[46px] items-center justify-center transition-colors ${
            isDark ? "text-white/50 hover:bg-white/10 hover:text-white/80" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <Maximize2 size={11} strokeWidth={1.5} />
          ) : (
            <Square size={11} strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={handleClose}
          className={`flex h-10 w-[46px] items-center justify-center transition-colors ${
            isDark ? "text-white/50 hover:bg-[#ef4444] hover:text-white" : "text-white/70 hover:bg-[#ef4444] hover:text-white"
          }`}
          title="关闭"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
