"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t("invalidCredentials"));
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 py-8">
      <h1 className="text-2xl font-bold">{t("signInTitle")}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" required placeholder={t("email")} value={email}
          onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" />
        <input type="password" required placeholder={t("password")} value={password}
          onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-brand py-2.5 font-medium text-white disabled:opacity-60">
          {loading ? t("signingIn") : t("signInBtn")}
        </button>
      </form>
      <button onClick={() => signIn("google")} className="w-full rounded-md border py-2.5 font-medium">
        {t("signInGoogle")}
      </button>
      <p className="text-center text-sm text-gray-500">
        {t("noAccount")} <Link href="/register" className="text-brand">{t("registerLink")}</Link>
      </p>
    </div>
  );
}
