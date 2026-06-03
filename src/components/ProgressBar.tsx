import { useTranslation } from "react-i18next";

type FileStatus = "pending" | "converting" | "completed" | "failed" | "cancelled";

interface ProgressBarProps {
  value: number;
  status: FileStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  status,
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const height = size === "sm" ? "h-1.5" : "h-2";

  const getBarColor = () => {
    switch (status) {
      case "completed":
        return "bg-primary";
      case "failed":
        return "bg-destructive";
      case "cancelled":
        return "bg-muted-foreground/30";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${height} flex-1 overflow-hidden rounded-full bg-secondary`}>
        <div
          className={`${height} rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 text-right text-xs text-muted-foreground">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

interface TotalProgressProps {
  completed: number;
  total: number;
  eta?: number;
}

export function TotalProgress({ completed, total, eta }: TotalProgressProps) {
  const { t } = useTranslation();
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  const formatETA = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return "--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-card p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {t("conversion.totalProgress")}: {completed} / {total}
        </span>
        {eta !== undefined && eta > 0 && (
          <span className="text-muted-foreground">
            {t("conversion.eta")}: {formatETA(eta)}
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
