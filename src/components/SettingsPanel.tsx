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
  Music,
  Sliders,
} from "lucide-react";
import { FormatSelector } from "./FormatSelector";
import { ParamPanel } from "./ParamPanel";
import { useTranslation } from "react-i18next";

export function SettingsPanel() {
  const { status, loading, detect, setCustomPath } = useFFmpeg();
  const [ffmpegPath, setFfmpegPath] = useState(status?.path || "");
  const { t } = useTranslation();
  const [sections, setSections] = useState({
    ffmpeg: false,
    format: true,
    params: false,
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
      className="flex w-full items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-card/50"
    >
      <Icon size={14} className="text-primary" />
      <span className="flex-1 text-left">{title}</span>
      {sections[sectionKey] ? (
        <ChevronDown size={13} className="text-muted-foreground" />
      ) : (
        <ChevronRight size={13} className="text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col">
      {/* Output Format Section (default expanded) */}
      <SectionHeader icon={Music} title={t("settings.outputFormat")} sectionKey="format" />
      {sections.format && (
        <div className="border-b border-sidebar-border px-4 pb-3">
          <FormatSelector />
        </div>
      )}

      {/* FFmpeg Section (default collapsed) */}
      <SectionHeader icon={Settings} title={t("ffmpeg.config")} sectionKey="ffmpeg" />
      {sections.ffmpeg && (
        <div className="flex flex-col gap-2.5 border-b border-sidebar-border px-4 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status?.found ? "bg-primary" : "bg-destructive"
              }`}
            />
            <span className="text-[11px] text-muted-foreground">
              {loading
                ? t("ffmpeg.detecting")
                : status?.found
                  ? `${t("ffmpeg.found")} (${status.version.split(" ").slice(2, 3).join(" ")})`
                  : t("ffmpeg.notFound")}
            </span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={ffmpegPath}
              onChange={(e) => setFfmpegPath(e.target.value)}
              placeholder={t("ffmpeg.pathPlaceholder")}
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <button
              onClick={handleBrowse}
              className="rounded-md bg-secondary px-2 py-1.5 text-secondary-foreground transition-colors hover:bg-muted"
              title={t("ffmpeg.browse")}
            >
              <FolderSearch size={13} />
            </button>
            <button
              onClick={detect}
              disabled={loading}
              className="rounded-md bg-secondary px-2 py-1.5 text-secondary-foreground transition-colors hover:bg-muted"
              title={t("ffmpeg.redetect")}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          {!status?.found && (
            <div className="rounded-md bg-destructive/5 p-2 text-[11px] text-destructive">
              <p className="mb-1">{t("ffmpeg.downloadPrompt")}</p>
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

      {/* Parameters Section (default collapsed) */}
      <SectionHeader icon={Sliders} title={t("settings.params")} sectionKey="params" />
      {sections.params && (
        <div className="border-b border-sidebar-border px-4 pb-3">
          <ParamPanel />
        </div>
      )}
    </div>
  );
}
