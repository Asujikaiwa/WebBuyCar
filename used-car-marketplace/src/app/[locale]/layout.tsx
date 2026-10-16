import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import Providers from "@/components/Providers";
import SiteHeader from "@/components/SiteHeader";
import { routing, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "ตลาดรถมือสอง | Used Car Marketplace",
  description: "ซื้อ-ขายรถยนต์มือสอง ค้นหารถในฝันของคุณ พร้อมคำนวณค่างวดและขอสินเชื่อ",
};

// สร้างหน้า static ล่วงหน้าสำหรับทุกภาษา (ดีต่อ SEO + ความเร็ว)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  // ตรวจ locale ที่รองรับ
  if (!routing.locales.includes(locale as Locale)) notFound();

  // เปิด static rendering ให้หน้า server รู้ locale
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html lang={locale}>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <SiteHeader />
            <main className="mx-auto max-w-6xl p-4">{children}</main>
            <footer className="mt-12 border-t bg-white py-6 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} CarMarket — {t("footer")}
            </footer>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
