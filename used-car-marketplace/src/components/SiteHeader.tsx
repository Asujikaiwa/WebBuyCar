"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// แถบเมนูด้านบน — ใช้ next-intl Link (เติม locale prefix อัตโนมัติ) + แปลข้อความ
export default function SiteHeader() {
  const t = useTranslations("nav");
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
        <Link href="/" className="text-xl font-bold text-brand">🚗 CarMarket</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-brand">{t("search")}</Link>
          <Link href="/sell" className="hover:text-brand">{t("sell")}</Link>
          <Link href="/finance" className="hover:text-brand">{t("finance")}</Link>
          <Link href="/packages" className="hover:text-brand">{t("packages")}</Link>
          <Link href="/messages" className="hover:text-brand">{t("messages")}</Link>
          <LanguageSwitcher />
          <Link href="/login" className="rounded-md bg-brand px-3 py-1.5 text-white">{t("login")}</Link>
        </nav>
      </div>
    </header>
  );
}
