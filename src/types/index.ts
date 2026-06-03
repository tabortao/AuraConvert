export type OutputFormat =
  | "mp3"
  | "aac"
  | "flac"
  | "wav"
  | "m4a"
  | "ogg"
  | "opus"
  | "alac"
  | "wma"
  | "ac3"
  | "aiff"
  | "eac3"
  | "dts"
  | "mp2"
  | "wavpack"
  | "tta"
  | "aptx"
  | "sbc"
  | "truehd"
  | "mlp"
  | "dfpwm";

export type BitrateOption = "auto" | 320 | 256 | 224 | 192 | 128 | 96 | 64 | 32 | "copy";
export type SampleRateOption = "auto" | 48000 | 44100 | 32000 | 24000 | 22050 | 16000 | 12000 | 11025 | 8000;
export type ChannelsOption = "auto" | 2 | 1;

export interface AudioFile {
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  isVideo: boolean;
  status: "pending" | "converting" | "completed" | "failed" | "cancelled";
  progress: number;
  error?: string;
  outputPath?: string;
  outputSize?: number;
  compressionRatio?: number;
  duration?: number;
}

export interface ConvertParams {
  format: OutputFormat;
  bitrate: BitrateOption;
  sampleRate: SampleRateOption;
  channels: ChannelsOption;
  bitDepth?: number;
  volume: number; // 10-400
  speed: number; // 0.25-4.00
  outputDir: "same" | "custom" | "ask";
  customOutputDir?: string;
  filenameTemplate: "original" | "custom";
}

export interface AudioInfo {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  track?: number;
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  bitDepth?: number;
  codec: string;
  format: string;
  coverArt?: string;
  fileSize: number;
}

export interface ConversionProgress {
  fileId: string;
  progress: number;
  speed?: string;
}

export interface TotalProgress {
  completed: number;
  total: number;
  percentage: number;
  eta: number;
}

export interface FfmpegStatus {
  found: boolean;
  path: string;
  version: string;
}
