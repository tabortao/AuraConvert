import { useConversionStore } from "../stores/conversionStore";
import { Minus, Plus, Gauge, Radio, Volume2, Zap } from "lucide-react";
import type { BitrateOption, SampleRateOption, ChannelsOption } from "../types";

const BITRATE_OPTIONS: { value: BitrateOption; label: string }[] = [
  { value: "auto", label: "自动" },
  { value: 320, label: "320 kbps (极高)" },
  { value: 256, label: "256 kbps" },
  { value: 224, label: "224 kbps" },
  { value: 192, label: "192 kbps" },
  { value: 128, label: "128 kbps (标准)" },
  { value: 96, label: "96 kbps" },
  { value: 64, label: "64 kbps" },
  { value: 32, label: "32 kbps (极低)" },
  { value: "copy", label: "直接复制 (不转码)" },
];

const SAMPLE_RATE_OPTIONS: { value: SampleRateOption; label: string }[] = [
  { value: "auto", label: "自动" },
  { value: 48000, label: "48000 Hz" },
  { value: 44100, label: "44100 Hz" },
  { value: 32000, label: "32000 Hz" },
  { value: 24000, label: "24000 Hz" },
  { value: 22050, label: "22050 Hz" },
  { value: 16000, label: "16000 Hz" },
  { value: 12000, label: "12000 Hz" },
  { value: 11025, label: "11025 Hz" },
  { value: 8000, label: "8000 Hz" },
];

const CHANNELS_OPTIONS: { value: ChannelsOption; label: string }[] = [
  { value: "auto", label: "自动" },
  { value: 2, label: "立体声" },
  { value: 1, label: "单声道" },
];

export function ParamPanel() {
  const params = useConversionStore((s) => s.params);
  const setParams = useConversionStore((s) => s.setParams);

  const adjustVolume = (delta: number) => {
    const newVol = Math.max(10, Math.min(400, params.volume + delta));
    setParams({ volume: newVol });
  };

  const adjustSpeed = (delta: number) => {
    const newSpeed = Math.max(0.25, Math.min(4.0, +(params.speed + delta).toFixed(2)));
    setParams({ speed: newSpeed });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Output Quality (Bitrate) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">输出质量</span>
        </div>
        <select
          value={String(params.bitrate)}
          onChange={(e) => {
            const val = e.target.value;
            setParams({
              bitrate: val === "auto" || val === "copy" ? val : Number(val) as BitrateOption,
            });
          }}
          className="w-full rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
        >
          {BITRATE_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sample Rate */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">采样率</span>
        </div>
        <select
          value={String(params.sampleRate)}
          onChange={(e) => {
            const val = e.target.value;
            setParams({
              sampleRate: val === "auto" ? "auto" : Number(val) as SampleRateOption,
            });
          }}
          className="w-full rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
        >
          {SAMPLE_RATE_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Channels */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">声道</span>
        </div>
        <select
          value={String(params.channels)}
          onChange={(e) => {
            const val = e.target.value;
            setParams({
              channels: val === "auto" ? "auto" : Number(val) as ChannelsOption,
            });
          }}
          className="w-full rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
        >
          {CHANNELS_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Volume */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">音量</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustVolume(-10)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            min={10}
            max={400}
            value={params.volume}
            onChange={(e) => {
              const val = Math.max(10, Math.min(400, Number(e.target.value)));
              setParams({ volume: val });
            }}
            className="h-7 w-16 rounded-lg border border-border bg-input px-2 text-center text-xs text-foreground focus:border-ring focus:outline-none"
          />
          <span className="text-xs text-muted-foreground">%</span>
          <button
            onClick={() => adjustVolume(10)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Speed */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">播放速度</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustSpeed(-0.25)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-medium">
            {params.speed.toFixed(2)}x
          </span>
          <button
            onClick={() => adjustSpeed(0.25)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
