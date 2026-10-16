import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// จัดการ locale routing: redirect ไป /th, /en, /zh และตรวจ locale ของทุก request
export default createMiddleware(routing);

export const config = {
  // ใช้กับทุก path ยกเว้น api, _next, ไฟล์ static
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
