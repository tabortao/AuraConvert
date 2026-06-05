import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./zh.json";
import en from "./en.json";

const detectLanguage = (): "zh" | "en" => {
  const lang = navigator.language || (navigator as any).userLanguage || "";
  return lang.startsWith("zh") ? "zh" : "en";
};

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
