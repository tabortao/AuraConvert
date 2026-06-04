import type { OutputFormat } from "../types";

// FFmpeg encoder mapping for all 13 formats (FFmpeg 8.1.1 essentials build)
export const FORMAT_ENCODER_MAP: Record<
  OutputFormat,
  { codec: string; container: string; lossless: boolean }
> = {
  mp3: { codec: "libmp3lame", container: "mp3", lossless: false },
  aac: { codec: "aac", container: "aac", lossless: false },
  flac: { codec: "flac", container: "flac", lossless: true },
  wav: { codec: "pcm_s16le", container: "wav", lossless: true },
  m4a: { codec: "aac", container: "ipod", lossless: false },
  ogg: { codec: "libvorbis", container: "ogg", lossless: false },
  opus: { codec: "opus", container: "opus", lossless: false },
  alac: { codec: "alac", container: "mp4", lossless: true },
  ac3: { codec: "ac3", container: "ac3", lossless: false },
  aiff: { codec: "pcm_s16be", container: "aiff", lossless: true },
  eac3: { codec: "eac3", container: "eac3", lossless: false },
  mp2: { codec: "mp2", container: "mp2", lossless: false },
  wavpack: { codec: "wavpack", container: "wv", lossless: true },
};

export function getFormatInfo(format: OutputFormat) {
  return FORMAT_ENCODER_MAP[format];
}
