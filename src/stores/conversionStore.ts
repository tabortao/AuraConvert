import { create } from "zustand";
import type { AudioFile, ConvertParams } from "../types";

interface ConversionState {
  files: AudioFile[];
  params: ConvertParams;
  isConverting: boolean;
  canCancel: boolean;

  addFiles: (files: AudioFile[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<AudioFile>) => void;
  clearFiles: () => void;
  setParams: (params: Partial<ConvertParams>) => void;
  setIsConverting: (value: boolean) => void;
  setCanCancel: (value: boolean) => void;
}

const DEFAULT_PARAMS: ConvertParams = {
  format: "mp3",
  bitrate: "auto",
  sampleRate: "auto",
  channels: "auto",
  volume: 100,
  speed: 1.0,
  outputDir: "same",
  filenameTemplate: "original",
};

export const useConversionStore = create<ConversionState>((set) => ({
  files: [],
  params: { ...DEFAULT_PARAMS },
  isConverting: false,
  canCancel: false,

  addFiles: (files) =>
    set((state) => ({
      files: [...state.files, ...files],
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),

  clearFiles: () => set({ files: [] }),

  setParams: (params) =>
    set((state) => ({
      params: { ...state.params, ...params },
    })),

  setIsConverting: (value) => set({ isConverting: value }),
  setCanCancel: (value) => set({ canCancel: value }),
}));
