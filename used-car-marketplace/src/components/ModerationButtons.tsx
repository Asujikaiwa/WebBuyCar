"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

// ปุ่มอนุมัติ/ปฏิเสธประกาศ (เรียก admin API แล้ว refresh)
export default function ModerationButtons({ listingId }: { listingId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "PUBLISHED" | "REJECTED") {
    setBusy(true);
    await fetch(`/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => setStatus("PUBLISHED")}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-60">
        {t("approve")}
      </button>
      <button disabled={busy} onClick={() => setStatus("REJECTED")}
        className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-60">
        {t("reject")}
      </button>
    </div>
  );
}
