import { create } from "zustand";
import i18n from "@/i18n";
import { getLocal, setLocal } from "@/store/wallet/tools/strage";

/** 切换语言时同步翻译实例、文档语言和持久化偏好。 */
export const useLanguage = create<{ language: string; setLanguage: (language: string) => void }>((set) => ({
  language: getLocal("language") || "zh",
  setLanguage: (language) => {
    if (!["zh", "en", "ja", "ko"].includes(language)) return;
    setLocal("language", language);
    void i18n.changeLanguage(language);
    if (typeof document !== "undefined") document.documentElement.lang = language;
    set({ language });
  },
}));
export default useLanguage;
