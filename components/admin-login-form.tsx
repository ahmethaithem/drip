"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

export function AdminLoginForm({ returnTo }: { returnTo: string }) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          returnTo,
        }),
      });
      const body = await response.json().catch(() => null) as
        | { error?: string; redirectTo?: string }
        | null;
      if (!response.ok) {
        setError(body?.error ?? "تعذر تسجيل الدخول. حاول مرة أخرى.");
        return;
      }
      window.location.assign(body?.redirectTo ?? "/admin");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <div className="admin-login-icon" aria-hidden="true"><LockKeyhole size={25} /></div>
      <p className="kicker">DRIP EGYPT · ADMIN</p>
      <h1>تسجيل دخول الإدارة</h1>
      <p className="admin-login-intro">أدخل بريد الإدارة وكلمة المرور لعرض الطلبات وإدارتها.</p>

      {error && <div className="form-error" role="alert">{error}</div>}

      <label className="field">
        <span>البريد الإلكتروني</span>
        <input name="email" type="email" autoComplete="username" dir="ltr" required />
      </label>
      <label className="field">
        <span>كلمة المرور</span>
        <input name="password" type="password" autoComplete="current-password" dir="ltr" required />
      </label>

      <button className="button button-dark button-full" type="submit" disabled={submitting}>
        {submitting ? "جاري تسجيل الدخول…" : "دخول لوحة الطلبات"}
      </button>
      <Link className="admin-login-back" href="/">العودة إلى المتجر</Link>
    </form>
  );
}
