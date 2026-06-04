import { useConversionStore } from "../stores/conversionStore";
import { OUTPUT_FORMATS } from "../utils/formatUtils";
import type { OutputFormat } from "../types";
import { useTranslation } from "react-i18next";

export function FormatSelector() {
  const { t } = useTranslation();
  const format = useConversionStore((s) => s.params.format);
  const setParams = useConversionStore((s) => s.setParams);

  const handleChange = (value: OutputFormat) => {
    setParams({ format: value });
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={format}
        onChange={(e) => handleChange(e.target.value as OutputFormat)}
        className="w-full rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
      >
        {OUTPUT_FORMATS.map((fmt) => (
          <option key={fmt.value} value={fmt.value}>
            {fmt.label} {fmt.lossless ? `(${t("settings.lossless")})` : `(${t("settings.lossy")})`}
          </option>
        ))}
      </select>
    </div>
  );
}
