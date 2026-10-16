"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";

// ปุ่มเริ่มแชตกับผู้ขาย: สร้าง/หาห้องแชตแล้วพาไปหน้าสนทนา
export default function ContactSellerButton({ listingId }: { listingId: string }) {
  const t = useTranslations("chat");
  const router = useRouter();
  const { status } = useSession();
  const [busy, setBusy] = useState(false);

  async function start() {
    if (status !== "authenticated") return router.push("/login");
    setBusy(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    setBusy(false);
    if (res.ok) {
      const convo = await res.json();
      router.push(`/messages/${convo.id}`);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? t("cannotStart"));
    }
  }

  return (
    <button onClick={start} disabled={busy}
      className="w-full rounded-md bg-brand py-2.5 font-medium text-white disabled:opacity-60">
      {busy ? t("opening") : `💬 ${t("contactSeller")}`}
    </button>
  );
}
