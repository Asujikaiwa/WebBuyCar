import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import BuyPackageButton from "@/components/BuyPackageButton";

// หน้าแพ็กเกจสำหรับดีลเลอร์
export default async function PackagesPage() {
  const t = await getTranslations("packages");

  const packages = await prisma.package.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
  });

  return (
    <div className="py-6">
      <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
      <p className="mb-6 text-gray-500">{t("subtitle")}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border bg-white p-6">
            <h2 className="text-lg font-bold">{p.name}</h2>
            {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
            <p className="my-3 text-3xl font-bold text-brand">
              {(p.priceCents / 100).toLocaleString()}
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ {t("quota", { count: p.listingQuota })}</li>
              <li>✓ {t("duration", { days: p.durationDays })}</li>
              {p.promotes && <li>✓ {t("promote")}</li>}
            </ul>
            <div className="mt-auto">
              <BuyPackageButton packageId={p.id} />
            </div>
          </div>
        ))}
      </div>
      {packages.length === 0 && <p className="text-gray-500">{t("empty")}</p>}
    </div>
  );
}
