import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface ListingCardData {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  priceCents: number;
  province: string;
  isPromoted?: boolean;
  images?: { url: string }[];
}

function formatTHB(cents: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ListingCard({ listing }: { listing: ListingCardData }) {
  const t = useTranslations("listing");
  const cover = listing.images?.[0]?.url;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {cover ? (
          // ใช้ <img> ในสตาร์ทเตอร์; production แนะนำ next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">{t("noImage")}</div>
        )}
        {listing.isPromoted && (
          <span className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
            {t("promoted")}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-medium group-hover:text-brand">{listing.title}</h3>
        <p className="text-sm text-gray-500">
          {listing.year} · {listing.mileage.toLocaleString()} {t("km")} · {listing.province}
        </p>
        <p className="mt-1 text-lg font-bold text-brand">{formatTHB(listing.priceCents)}</p>
      </div>
    </Link>
  );
}
