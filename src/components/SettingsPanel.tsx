import { useState } from "react";
import { useFFmpeg } from "../hooks/useFFmpeg";
import { invoke } from "@tauri-apps/api/core";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  FolderSearch,
  ExternalLink,
  Settings,
  FolderOutput,
} from "lucide-react";
import { FormatSelector } from "./FormatSelector";
import { ParamPanel } from "./ParamPanel";
import { useTranslation } from "react-i18next";

export function SettingsPanel() {
  const { status, loading, detect, setCustomPath } = useFFmpeg();
  const [ffmpegPath, setFfmpegPath] = useState(status?.path || "");
  const { t } = useTranslation();
  const [sections, setSections] = useState({
    ffmpeg: true,
    format: true,
    params: true,
    output: true,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBrowse = async () => {
    const selected = await invoke<string | null>("select_ffmpeg_exe");
    if (selected) {
      setFfmpegPath(selected);
      await setCustomPath(selected);
    }
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    sectionKey,
  }: {
    icon: React.ElementType;
    title: string;
    sectionKey: keyof typeof sections;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center gap-2 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
    >
      <Icon size={16} className="text-muted-foreground" />
      <span className="flex-1 text-left">{title}</span>
      {sections[sectionKey] ? (
        <ChevronDown size={14} className="text-muted-foreground" />
      ) : (
        <ChevronRight size={14} className="text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-1 p-4">
      {/* FFmpeg Section */}
      <SectionHeader icon={Settings} title={t("ffmpeg.config")} sectionKey="ffmpeg" />
      {sections.ffmpeg && (
        <div className="ml-6 flex flex-col gap-3 pb-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status?.found ? "bg-primary" : "bg-destructive"
              }`}
            />
            <span className="text-xs">
              {loading
                ? t("ffmpeg.detecting")
                : status?.found
                  ? `${t("ffmpeg.found")} (${status.version.split(" ").slice(2, 3).join(" ")})`
                  : t("ffmpeg.notFound")}
            </span>
          </div>

          {/* Path Input */}
          <div className="flex gap-1.5">
            <input
              type="text"
              value={ffmpegPath}
              onChange={(e) => setFfmpegPath(e.target.value)}
              placeholder={t("ffmpeg.pathPlaceholder")}
              className="flex-1 rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <button
              onClick={handleBrowse}
              className="rounded-lg bg-secondary px-2 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80"
              title={t("ffmpeg.browse")}
            >
              <FolderSearch size={14} />
            </button>
            <button
              onClick={detect}
              disabled={loading}
              className="rounded-lg bg-secondary px-2 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80"
              title={t("ffmpeg.redetect")}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Download Prompt */}
          {!status?.found && (
            <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
              <p className="mb-1.5">
                {t("ffmpeg.downloadPrompt")}
              </p>
              <a
                href="https://www.gyan.dev/ffmpeg/builds/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {t("ffmpeg.downloadLink")} <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-border" />

      {/* Output Format Section */}
      <SectionHeader icon={Settings} title={t("settings.outputFormat")} sectionKey="format" />
      {sections.format && (
        <div className="ml-6 pb-3">
          <FormatSelector />
        </div>
      )}

      <div className="border-t border-border" />

      {/* Parameters Section */}
      <SectionHeader icon={Settings} title={t("settings.params")} sectionKey="params" />
      {sections.params && (
        <div className="ml-6 pb-3">
          <ParamPanel />
        </div>
      )}

      <div className="border-t border-border" />

      {/* Output Directory Section */}
      <SectionHeader icon={FolderOutput} title={t("settings.outputDir")} sectionKey="output" />
      {sections.output && (
        <div className="ml-6 flex flex-col gap-2 pb-3">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="radio"
              name="outputDir"
              defaultChecked
              className="accent-primary"
            />
            {t("settings.sameAsSource")}
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="radio" name="outputDir" className="accent-primary" />
            {t("settings.customDir")}
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="radio" name="outputDir" className="accent-primary" />
            {t("settings.askEachTime")}
          </label>
        </div>
      )}
    </div>
  );
}