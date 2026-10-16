import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

// หน้าภาพรวม: สถิติสำคัญของแพลตฟอร์ม
export default async function AdminOverviewPage() {
  const t = await getTranslations("admin");

  const [users, listings, pending, sold, paidOrders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
  ]);

  const totalRevenue = (revenue._sum.amountCents ?? 0) / 100;

  const cards = [
    { label: t("statUsers"), value: users.toLocaleString() },
    { label: t("statListings"), value: listings.toLocaleString() },
    { label: t("statPending"), value: pending.toLocaleString() },
    { label: t("statSold"), value: sold.toLocaleString() },
    { label: t("statPaidOrders"), value: paidOrders.toLocaleString() },
    { label: t("statRevenue"), value: totalRevenue.toLocaleString() },
  ];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("overviewTitle")}</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
