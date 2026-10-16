import { defineRouting } from "next-intl/routing";

// นิยาม locale ที่รองรับ + ค่าเริ่มต้น
// localePrefix "always" → ทุก URL มี prefix ภาษา (/th, /en, /zh) ดีต่อ SEO แยกภาษา
export const routing = defineRouting({
  locales: ["th", "en", "zh"],
  defaultLocale: "th",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  th: "ไทย",
  en: "English",
  zh: "中文",
};
