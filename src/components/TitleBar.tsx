import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Minus, Square, X, Maximize2 } from "lucide-react";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Listen for window state changes
    const checkMaximized = async () => {
      try {
        const maximized = await invoke<boolean>("is_window_maximized");
        setIsMaximized(maximized);
      } catch {
        // command may not exist yet
      }
    };
    checkMaximized();
  }, []);

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

  return (
    <div
      data-tauri-drag-region
      className="flex h-9 shrink-0 items-center justify-between select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Left: App icon + title */}
      <div className="flex items-center gap-2 px-4">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
          <span className="text-xs">🎵</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          AuraConvert
        </span>
      </div>

      {/* Right: Window controls */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="最小化"
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleMaximize}
          className="flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <Maximize2 size={12} strokeWidth={1.5} />
          ) : (
            <Square size={12} strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={handleClose}
          className="flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          title="关闭"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
