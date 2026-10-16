import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import ContactSellerButton from "@/components/ContactSellerButton";

function formatTHB(cents: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// หน้ารายละเอียดรถ — Server Component พร้อม metadata เพื่อ SEO
export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const t = await getTranslations("listing");
  const ts = await getTranslations("sell");

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: { select: { name: true, phone: true, dealerProfile: true } },
    },
  });

  if (!listing) notFound();

  const similar = await prisma.listing.findMany({
    where: { make: listing.make, status: "PUBLISHED", id: { not: listing.id } },
    take: 4,
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  });

  const fuelLabel: Record<string, string> = {
    GASOLINE: ts("fuelGasoline"), DIESEL: ts("fuelDiesel"), HYBRID: ts("fuelHybrid"),
    EV: ts("fuelEv"), LPG_NGV: ts("fuelLpg"),
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* แกลเลอรีรูป */}
        <div className="lg:col-span-2">
          <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
            {listing.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">{t("noImage")}</div>
            )}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {listing.images.slice(1, 6).map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={img.url} alt="" className="aspect-square rounded-md object-cover" />
            ))}
          </div>
        </div>

        {/* ข้อมูลหลัก + ติดต่อ */}
        <aside className="space-y-4">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-3xl font-bold text-brand">{formatTHB(listing.priceCents)}</p>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Info label={t("specMake")} value={listing.make} />
            <Info label={t("specModel")} value={listing.model} />
            <Info label={t("specYear")} value={String(listing.year)} />
            <Info label={t("specMileage")} value={`${listing.mileage.toLocaleString()} ${t("km")}`} />
            <Info label={t("specTransmission")} value={listing.transmission === "AUTO" ? ts("transAuto") : ts("transManual")} />
            <Info label={t("specFuel")} value={fuelLabel[listing.fuelType] ?? listing.fuelType} />
            <Info label={t("specProvince")} value={listing.province} />
            {listing.color && <Info label={t("specColor")} value={listing.color} />}
          </dl>
          <div className="space-y-2">
            <ContactSellerButton listingId={listing.id} />
            <button className="w-full rounded-md border border-brand py-2.5 font-medium text-brand">
              📞 {listing.seller.phone ?? t("callSeller")}
            </button>
            <a
              href={`finance?price=${listing.priceCents / 100}`}
              className="block w-full rounded-md bg-amber-500 py-2.5 text-center font-medium text-white"
            >
              🧮 {t("financeCta")}
            </a>
          </div>
        </aside>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">{t("details")}</h2>
        <p className="whitespace-pre-line text-gray-700">{listing.description}</p>
      </section>

      {similar.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t("similar")}</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 p-2">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
