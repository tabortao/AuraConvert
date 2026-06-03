import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { FfmpegStatus } from "../types";

const STORAGE_KEY = "auraconvert-ffmpeg-status";

function getStoredStatus(): FfmpegStatus | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function setStoredStatus(status: FfmpegStatus | null) {
  try {
    if (status) localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function useFFmpeg() {
  const [status, setStatus] = useState<FfmpegStatus | null>(getStoredStatus);
  const [loading, setLoading] = useState(!getStoredStatus());
  const isDetecting = useRef(false);

  const detect = useCallback(async () => {
    if (isDetecting.current) return;
    isDetecting.current = true;
    setLoading(true);
    try {
      const result = await invoke<FfmpegStatus>("detect_ffmpeg");
      setStatus(result);
      setStoredStatus(result);
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {
      const failed: FfmpegStatus = { found: false, path: "", version: "" };
      setStatus(failed);
      setStoredStatus(failed);
    } finally {
      setLoading(false);
      isDetecting.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial detect if no cached status
    if (!getStoredStatus()) {
      detect();
    }

    // Listen for changes from other tabs / hook instances
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setStatus(getStoredStatus());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [detect]);

  const setCustomPath = useCallback(async (path: string) => {
    try {
      const { LazyStore } = await import("@tauri-apps/plugin-store");
      const store = new LazyStore("settings.json");
      await store.set("ffmpeg_path", path);
    } catch {
      // Store not available yet
    }
    await detect();
  }, [detect]);

  return { status, loading, detect, setCustomPath };
}