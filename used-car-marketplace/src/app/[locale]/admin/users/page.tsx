import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

// หน้าจัดการผู้ใช้: รายชื่อผู้ใช้ล่าสุด + บทบาท + จำนวนประกาศ
export default async function AdminUsersPage() {
  const t = await getTranslations("admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { listings: true } } },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("usersTitle", { count: users.length })}</h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="p-3">{t("colName")}</th>
              <th className="p-3">{t("colEmail")}</th>
              <th className="p-3">{t("colRole")}</th>
              <th className="p-3">{t("colListings")}</th>
              <th className="p-3">{t("colJoined")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3">{u.name ?? "-"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{u.role}</span>
                </td>
                <td className="p-3">{u._count.listings}</td>
                <td className="p-3 text-gray-500">{u.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
