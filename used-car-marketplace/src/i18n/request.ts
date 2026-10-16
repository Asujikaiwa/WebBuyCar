import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// โหลด message catalog ตาม locale ของแต่ละ request (ใช้ฝั่ง server)
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // ป้องกัน locale ที่ไม่รองรับ → fallback เป็นค่าเริ่มต้น
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
