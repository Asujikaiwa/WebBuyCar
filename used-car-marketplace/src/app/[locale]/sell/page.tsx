"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

// หน้าลงประกาศขายรถ + อัปโหลดรูปตรงไป S3/R2 ผ่าน presigned URL
export default function SellPage() {
  const t = useTranslations("sell");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    make: "", model: "", year: 2020, mileage: 0, price: 0,
    province: "", transmission: "AUTO", fuelType: "GASOLINE", title: "", description: "",
  });

  function set(k: string, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) continue;
      const { uploadUrl, publicUrl } = await presignRes.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      urls.push(publicUrl);
    }
    setImageUrls((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return router.push("/login");
    setSubmitting(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
        imageUrls,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      alert(t("submitted"));
      router.push("/");
    } else {
      const err = await res.json().catch(() => ({}));
      if (err.code === "QUOTA_EXCEEDED") {
        if (confirm(t("quotaPrompt"))) router.push("/packages");
      } else {
        alert(t("error"));
      }
    }
  }

  if (status === "loading") return <p>...</p>;
  if (!session)
    return (
      <p className="py-8 text-center">
        {t("loginRequired")} <a href="login" className="text-brand">{t("loginCta")}</a>
      </p>
    );

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4 py-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Input label={t("make")} value={form.make} onChange={(v) => set("make", v)} />
        <Input label={t("model")} value={form.model} onChange={(v) => set("model", v)} />
        <Input label={t("year")} type="number" value={form.year} onChange={(v) => set("year", v)} />
        <Input label={t("mileage")} type="number" value={form.mileage} onChange={(v) => set("mileage", v)} />
        <Input label={t("price")} type="number" value={form.price} onChange={(v) => set("price", v)} />
        <Input label={t("province")} value={form.province} onChange={(v) => set("province", v)} />
        <Select label={t("transmission")} value={form.transmission} onChange={(v) => set("transmission", v)}
          options={[["AUTO", t("transAuto")], ["MANUAL", t("transManual")]]} />
        <Select label={t("fuel")} value={form.fuelType} onChange={(v) => set("fuelType", v)}
          options={[["GASOLINE", t("fuelGasoline")], ["DIESEL", t("fuelDiesel")], ["HYBRID", t("fuelHybrid")], ["EV", t("fuelEv")], ["LPG_NGV", t("fuelLpg")]]} />
      </div>

      <Input label={t("listingTitle")} value={form.title} onChange={(v) => set("title", v)} />
      <label className="block">
        <span className="text-sm font-medium">{t("description")}</span>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
          rows={4} className="mt-1 w-full rounded-md border px-3 py-2" />
      </label>

      <div>
        <span className="text-sm font-medium">{t("images")}</span>
        <input type="file" accept="image/*" multiple onChange={onFiles} className="mt-1 block" />
        {uploading && <p className="text-sm text-gray-500">{t("uploading")}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {imageUrls.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt="" className="h-20 w-20 rounded object-cover" />
          ))}
        </div>
      </div>

      <button disabled={submitting || uploading}
        className="w-full rounded-md bg-brand py-3 font-medium text-white disabled:opacity-60">
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function Input({ label, value, onChange, type = "text" }:
  { label: string; value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} required value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border px-3 py-2" />
    </label>
  );
}

function Select({ label, value, onChange, options }:
  { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border px-3 py-2">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
