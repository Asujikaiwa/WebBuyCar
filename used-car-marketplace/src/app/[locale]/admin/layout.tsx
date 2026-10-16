import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/session";

// Guard: เฉพาะ ADMIN เท่านั้นที่เข้าได้ ไม่ใช่ → เด้งไป login
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const t = await getTranslations("admin");

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="space-y-1">
        <h2 className="mb-2 text-lg font-bold">{t("brand")}</h2>
        <Link href="/admin" className="block rounded px-3 py-2 hover:bg-gray-100">{t("overview")}</Link>
        <Link href="/admin/listings" className="block rounded px-3 py-2 hover:bg-gray-100">{t("approveListings")}</Link>
        <Link href="/admin/users" className="block rounded px-3 py-2 hover:bg-gray-100">{t("manageUsers")}</Link>
      </aside>
      <section>{children}</section>
    </div>
  );
}
