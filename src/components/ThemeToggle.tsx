import { Moon, Sun } from "lucide-react";
import { useSettingsStore } from "../stores/settingsStore";
import { useEffect } from "react";

interface ThemeToggleProps {
  light?: boolean;
}

export function ThemeToggle({ light }: ThemeToggleProps) {
  const theme = useSettingsStore((s) => s.theme);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    updateSetting("theme", newTheme);
  };

  const colorClass = light
    ? "text-white/60 hover:text-white hover:bg-white/10"
    : "text-muted-foreground hover:bg-secondary hover:text-foreground";

  return (
    <button
      onClick={toggle}
      className={`flex h-10 w-10 items-center justify-center transition-colors ${colorClass}`}
      title={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
