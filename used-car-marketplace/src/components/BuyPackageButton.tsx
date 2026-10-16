"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";

// ปุ่มซื้อแพ็กเกจ: เรียก /api/checkout แล้ว redirect ไปหน้าจ่ายเงินของ provider
export default function BuyPackageButton({ packageId }: { packageId: string }) {
  const t = useTranslations("packages");
  const router = useRouter();
  const { status } = useSession();
  const [busy, setBusy] = useState(false);

  async function buy() {
    if (status !== "authenticated") return router.push("/login");
    setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    setBusy(false);
    if (res.ok) {
      const { redirectUrl } = await res.json();
      window.location.href = redirectUrl; // ไปหน้าจ่ายเงิน
    } else {
      alert(t("error"));
    }
  }

  return (
    <button onClick={buy} disabled={busy}
      className="mt-4 w-full rounded-md bg-brand py-2.5 font-medium text-white disabled:opacity-60">
      {busy ? t("buying") : t("buy")}
    </button>
  );
}
