"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, localeNames, type Locale } from "@/i18n/routing";

// สลับภาษา ไทย/อังกฤษ/จีน — เปลี่ยน locale prefix ของ URL ปัจจุบัน (ดีต่อ SEO)
export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function change(next: Locale) {
    // เปลี่ยนเฉพาะ locale แต่อยู่หน้าเดิม
    router.replace(pathname, { locale: next });
  }

  return (
    <select
      value={locale}
      onChange={(e) => change(e.target.value as Locale)}
      className="rounded-md border px-2 py-1 text-sm"
      aria-label="เลือกภาษา / Language"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}
