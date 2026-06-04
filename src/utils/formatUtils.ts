import type { OutputFormat } from "../types";

export const SUPPORTED_AUDIO_EXTENSIONS = [
  "mp3", "aac", "flac", "wav", "m4a", "ogg", "opus", "alac",
  "ac3", "aiff", "eac3", "mp2", "wv", "ape", "amr",
  "mid", "midi", "spx", "mp4", "mka", "mkv",
];

export const SUPPORTED_VIDEO_EXTENSIONS = [
  "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "m4v", "mpg",
  "mpeg", "3gp", "ts", "mts", "m2ts", "vob",
];

export const ALL_SUPPORTED_EXTENSIONS = [
  ...SUPPORTED_AUDIO_EXTENSIONS,
  ...SUPPORTED_VIDEO_EXTENSIONS,
];

export const OUTPUT_FORMATS: {
  value: OutputFormat;
  label: string;
  lossless: boolean;
}[] = [
  { value: "mp3", label: "MP3", lossless: false },
  { value: "aac", label: "AAC", lossless: false },
  { value: "flac", label: "FLAC", lossless: true },
  { value: "wav", label: "WAV", lossless: true },
  { value: "m4a", label: "M4A", lossless: false },
  { value: "ogg", label: "OGG Vorbis", lossless: false },
  { value: "opus", label: "Opus", lossless: false },
  { value: "alac", label: "ALAC", lossless: true },
  { value: "ac3", label: "AC3", lossless: false },
  { value: "aiff", label: "AIFF", lossless: true },
  { value: "eac3", label: "E-AC3", lossless: false },
  { value: "mp2", label: "MP2", lossless: false },
  { value: "wavpack", label: "WavPack", lossless: true },
];

export function isVideoFile(extension: string): boolean {
  return SUPPORTED_VIDEO_EXTENSIONS.includes(extension.toLowerCase());
}

export function isSupportedFile(extension: string): boolean {
  return ALL_SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}
