"use client";

import { useTranslations } from "next-intl";

// ส่วนหัวหน้าแรก + ฟอร์มค้นหา (แปลภาษาตาม locale ผ่าน next-intl)
export default function HomeHero({ defaults }: { defaults: { q?: string; minPrice?: string; maxPrice?: string } }) {
  const t = useTranslations("home");
  return (
    <section className="rounded-2xl bg-brand p-8 text-white">
      <h1 className="text-2xl font-bold">{t("heroTitle")}</h1>
      <p className="mt-1 text-white/80">{t("heroSubtitle")}</p>
      <form action="" method="get" className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={defaults.q} placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-md px-3 py-2 text-gray-900" />
        <input name="minPrice" defaultValue={defaults.minPrice} placeholder={t("minPrice")}
          className="w-32 rounded-md px-3 py-2 text-gray-900" />
        <input name="maxPrice" defaultValue={defaults.maxPrice} placeholder={t("maxPrice")}
          className="w-32 rounded-md px-3 py-2 text-gray-900" />
        <button className="rounded-md bg-amber-500 px-5 py-2 font-medium">{t("searchBtn")}</button>
      </form>
    </section>
  );
}
