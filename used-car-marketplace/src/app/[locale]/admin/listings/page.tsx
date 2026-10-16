import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ModerationButtons from "@/components/ModerationButtons";

// หน้าอนุมัติประกาศ: แสดงประกาศที่รออนุมัติทั้งหมด
export default async function AdminListingsPage() {
  const t = await getTranslations("admin");

  const listings = await prisma.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("pendingTitle", { count: listings.length })}</h1>
      {listings.length === 0 && <p className="text-gray-500">{t("noPending")}</p>}
      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="flex items-center gap-4 rounded-xl border bg-white p-3">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
              {l.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.images[0].url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{l.title}</p>
              <p className="text-sm text-gray-500">
                {(l.priceCents / 100).toLocaleString()} · {l.province} · {t("by")} {l.seller.name ?? l.seller.email}
              </p>
            </div>
            <ModerationButtons listingId={l.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
