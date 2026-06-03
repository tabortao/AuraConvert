import type { OutputFormat } from "../types";

// FFmpeg encoder mapping for all 21 formats
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
  opus: { codec: "libopus", container: "ogg", lossless: false },
  alac: { codec: "alac", container: "mp4", lossless: true },
  wma: { codec: "wmav2", container: "asf", lossless: false },
  ac3: { codec: "ac3", container: "ac3", lossless: false },
  aiff: { codec: "pcm_s16be", container: "aiff", lossless: true },
  eac3: { codec: "eac3", container: "eac3", lossless: false },
  dts: { codec: "dca", container: "dts", lossless: false },
  mp2: { codec: "mp2", container: "mp2", lossless: false },
  wavpack: { codec: "wavpack", container: "wv", lossless: true },
  tta: { codec: "tta", container: "tta", lossless: true },
  aptx: { codec: "libaptx", container: "aptx", lossless: false },
  sbc: { codec: "sbc", container: "sbc", lossless: false },
  truehd: { codec: "truehd", container: "truehd", lossless: true },
  mlp: { codec: "mlp", container: "mlp", lossless: true },
  dfpwm: { codec: "dfpwm", container: "dfpwm", lossless: false },
};

export function getFormatInfo(format: OutputFormat) {
  return FORMAT_ENCODER_MAP[format];
}
