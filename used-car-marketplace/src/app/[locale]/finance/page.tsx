"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateMonthlyPayment } from "@/lib/finance";

// หน้าคำนวณค่างวด (Client Component — โต้ตอบทันทีโดยไม่ต้องเรียก API)
export default function FinancePage() {
  const t = useTranslations("finance");
  const [price, setPrice] = useState(500000);
  const [downPercent, setDownPercent] = useState(20);
  const [rate, setRate] = useState(3.5);
  const [term, setTerm] = useState(60);

  const downPayment = (price * downPercent) / 100;
  const monthly =
    calculateMonthlyPayment({
      priceCents: price * 100,
      downPaymentCents: downPayment * 100,
      annualInterestRate: rate,
      termMonths: term,
    }) / 100;

  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
  const baht = t("perMonth").split("/")[0]; // "บาท" / "THB" / "泰铢"

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="space-y-4 rounded-xl border bg-white p-6">
        <Field label={`${t("price")}: ${fmt(price)} ${baht}`}>
          <input type="range" min={50000} max={3000000} step={10000} value={price}
            onChange={(e) => setPrice(Number(e.target.value))} className="w-full" />
        </Field>
        <Field label={`${t("downPayment")}: ${downPercent}% (${fmt(downPayment)} ${baht})`}>
          <input type="range" min={0} max={50} value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))} className="w-full" />
        </Field>
        <Field label={`${t("interest")}: ${rate}% ${t("perYear")}`}>
          <input type="range" min={0} max={10} step={0.1} value={rate}
            onChange={(e) => setRate(Number(e.target.value))} className="w-full" />
        </Field>
        <Field label={`${t("term")}: ${term} ${t("months")}`}>
          <input type="range" min={12} max={84} step={12} value={term}
            onChange={(e) => setTerm(Number(e.target.value))} className="w-full" />
        </Field>
      </div>

      <div className="rounded-xl bg-brand p-6 text-center text-white">
        <p className="text-white/80">{t("monthlyLabel")}</p>
        <p className="text-4xl font-bold">{fmt(monthly)} {t("perMonth")}</p>
        <p className="mt-1 text-sm text-white/70">
          {t("financed")} {fmt(price - downPayment)} {baht} · {t("total")} {fmt(monthly * term)} {baht}
        </p>
      </div>

      <button className="w-full rounded-md bg-amber-500 py-3 font-medium text-white">
        {t("requestLoan")}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
