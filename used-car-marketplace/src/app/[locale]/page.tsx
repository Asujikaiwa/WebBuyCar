import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import HomeHero from "@/components/HomeHero";

// หน้าแรก: ช่องค้นหา + ฟิลเตอร์ + รายการรถ (Server Component, SEO-friendly)
export default async function HomePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string; make?: string; minPrice?: string; maxPrice?: string; sort?: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");

  const where: any = { status: "PUBLISHED" };
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { make: { contains: searchParams.q, mode: "insensitive" } },
      { model: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.make) where.make = searchParams.make;
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.priceCents = {};
    if (searchParams.minPrice) where.priceCents.gte = Number(searchParams.minPrice) * 100;
    if (searchParams.maxPrice) where.priceCents.lte = Number(searchParams.maxPrice) * 100;
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
    take: 24,
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <HomeHero defaults={{ q: searchParams.q, minPrice: searchParams.minPrice, maxPrice: searchParams.maxPrice }} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {listings.length > 0 ? t("found", { count: listings.length }) : t("empty")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        {listings.length === 0 && (
          <p className="text-gray-500">
            <code className="rounded bg-gray-100 px-1">npm run db:seed</code>
          </p>
        )}
      </section>
    </div>
  );
}
