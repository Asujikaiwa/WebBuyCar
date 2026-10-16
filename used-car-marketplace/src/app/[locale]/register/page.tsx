"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BUYER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t("registerFailed"));
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 py-8">
      <h1 className="text-2xl font-bold">{t("registerTitle")}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input required placeholder={t("name")} value={form.name}
          onChange={(e) => set("name", e.target.value)} className="w-full rounded-md border px-3 py-2" />
        <input type="email" required placeholder={t("email")} value={form.email}
          onChange={(e) => set("email", e.target.value)} className="w-full rounded-md border px-3 py-2" />
        <input type="password" required minLength={8} placeholder={t("passwordHint")} value={form.password}
          onChange={(e) => set("password", e.target.value)} className="w-full rounded-md border px-3 py-2" />
        <select value={form.role} onChange={(e) => set("role", e.target.value)} className="w-full rounded-md border px-3 py-2">
          <option value="BUYER">{t("roleBuyer")}</option>
          <option value="SELLER">{t("roleSeller")}</option>
          <option value="DEALER">{t("roleDealer")}</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-brand py-2.5 font-medium text-white disabled:opacity-60">
          {loading ? t("registering") : t("registerBtn")}
        </button>
      </form>
    </div>
  );
}
