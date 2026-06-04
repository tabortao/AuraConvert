import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useConversionStore } from "../stores/conversionStore";
import { useToastStore } from "../stores/toastStore";
import type { ConversionProgress, TotalProgress } from "../types";

export function useConversion() {
  const store = useConversionStore();

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    listen<ConversionProgress>("conversion-progress", (event) => {
      store.updateFile(event.payload.fileId, { progress: event.payload.progress });
    }).then((unsub) => unsubs.push(unsub));

    listen<{ fileId: string; status: string }>("file-status-changed", (event) => {
      store.updateFile(event.payload.fileId, {
        status: event.payload.status as any,
      });
    }).then((unsub) => unsubs.push(unsub));

    listen<{
      fileId: string;
      status: string;
      outputPath: string;
      outputSize: number;
      compressionRatio: number | null;
    }>("file-completed", (event) => {
      store.updateFile(event.payload.fileId, {
        status: "completed",
        outputPath: event.payload.outputPath,
        outputSize: event.payload.outputSize,
        compressionRatio: event.payload.compressionRatio ?? undefined,
      });
    }).then((unsub) => unsubs.push(unsub));

    listen<{ fileId: string; status: string; error: string }>("file-failed", (event) => {
      store.updateFile(event.payload.fileId, {
        status: "failed",
        error: event.payload.error,
      });
    }).then((unsub) => unsubs.push(unsub));

    listen<TotalProgress>("total-progress", (event) => {
      // Total progress can be used in UI if needed
      console.log("Total progress:", event.payload);
    }).then((unsub) => unsubs.push(unsub));

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  const startConversion = async () => {
    const pendingFiles = store.files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    store.setIsConverting(true);
    store.setCanCancel(true);
    const startTime = Date.now();

    try {
      await invoke("start_conversion", {
        files: pendingFiles.map((f) => ({
          id: f.id,
          path: f.path,
          name: f.name,
          size: f.size,
          duration: f.duration,
          extension: f.extension,
        })),
        params: {
          format: store.params.format,
          bitrate: store.params.bitrate,
          sample_rate: store.params.sampleRate,
          channels: store.params.channels,
          bit_depth: store.params.bitDepth,
          volume: store.params.volume,
          speed: store.params.speed,
          output_dir: store.params.outputDir === "custom" ? store.params.customOutputDir : null,
          filename_template: store.params.filenameTemplate,
        },
      });
    } catch (e: any) {
      console.error("Conversion failed:", e);
      const errorMsg = typeof e === "string" ? e : e?.message || "Unknown error";
      pendingFiles.forEach((f) => {
        store.updateFile(f.id, { status: "failed", error: errorMsg });
      });
    } finally {
      store.setIsConverting(false);
      store.setCanCancel(false);

      // Show summary toast
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const latest = useConversionStore.getState();
      const completed = latest.files.filter((f) => f.status === "completed").length;
      const failed = latest.files.filter((f) => f.status === "failed").length;
      const total = pendingFiles.length;

      if (completed > 0 && failed === 0) {
        useToastStore.getState().addToast({
          message: `全部完成 (${completed} 个文件, 耗时 ${elapsed}s)`,
          type: "success",
        });
      } else if (completed > 0 && failed > 0) {
        useToastStore.getState().addToast({
          message: `完成 ${completed}/${total} (${failed} 个失败, 耗时 ${elapsed}s)`,
          type: "error",
        });
      } else if (failed > 0) {
        useToastStore.getState().addToast({
          message: `全部失败 (${failed} 个文件, 耗时 ${elapsed}s)`,
          type: "error",
        });
      }
    }
  };

  const cancelConversion = async () => {
    try {
      await invoke("cancel_conversion");
      store.setCanCancel(false);
    } catch (e) {
      console.error("Cancel failed:", e);
    }
  };

  return {
    isConverting: store.isConverting,
    canCancel: store.canCancel,
    startConversion,
    cancelConversion,
  };
}
