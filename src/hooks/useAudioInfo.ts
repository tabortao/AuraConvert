import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AudioInfo } from "../types";

export function useAudioInfo() {
  const [info, setInfo] = useState<AudioInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInfo = async (filePath: string) => {
    setLoading(true);
    try {
      const result = await invoke<AudioInfo>("read_audio_info", {
        filePath,
      });
      setInfo(result);
    } catch (e) {
      console.error("Failed to read audio info:", e);
    } finally {
      setLoading(false);
    }
  };

  return { info, loading, fetchInfo };
}
