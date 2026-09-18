import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import { getLocal } from "@/store/wallet/tools/strage";

// 本地资源同步初始化，保证首次弹窗与 toast 的翻译可用。
// 构建时统一使用中文，浏览器挂载后再读取用户偏好。
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh }, ja: { translation: ja }, ko: { translation: ko } },
  lng: "zh",
  fallbackLng: "zh",
  supportedLngs: ["zh", "en", "ja", "ko"],
  initAsync: false,
  interpolation: { escapeValue: false },
});

/** 只在浏览器挂载后恢复语言，并同步屏幕阅读器使用的文档语言。 */
export function restoreLanguage() {
  void i18n.changeLanguage(getLocal("language") || "zh");
  document.documentElement.lang = i18n.resolvedLanguage || "zh";
}
export default i18n;
