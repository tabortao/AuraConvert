import { create } from "zustand";
import type { OutputFormat } from "../types";

interface Settings {
  ffmpegPath: string;
  defaultFormat: OutputFormat;
  defaultBitrate: number;
  defaultSampleRate: number;
  defaultChannels: number;
  outputDirMode: "same" | "custom" | "ask";
  customOutputDir: string;
  filenameTemplate: "original" | "suffix";
  language: "zh" | "en";
  theme: "dark" | "light";
}

interface SettingsState extends Settings {
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ffmpegPath: "",
  defaultFormat: "mp3",
  defaultBitrate: 320,
  defaultSampleRate: 48000,
  defaultChannels: 2,
  outputDirMode: "same",
  customOutputDir: "",
  filenameTemplate: "original",
  language: "zh",
  theme: "dark",

  loadSettings: async () => {
    try {
      const { LazyStore } = await import("@tauri-apps/plugin-store");
      const store = new LazyStore("settings.json");
      const settings = await store.get<Settings>("settings");
      if (settings) {
        set(settings);
        if (settings.language) {
          try {
            const { default: i18n } = await import("../i18n");
            i18n.changeLanguage(settings.language);
          } catch {}
        }
      }
    } catch {
      // Store not available yet
    }
  },

  saveSettings: async () => {
    try {
      const { LazyStore } = await import("@tauri-apps/plugin-store");
      const store = new LazyStore("settings.json");
      const { loadSettings, saveSettings, ...settings } = get();
      await store.set("settings", settings);
    } catch {
      // Store not available yet
    }
  },

  updateSetting: (key, value) => {
    set({ [key]: value });
    get().saveSettings();
  },
}));
