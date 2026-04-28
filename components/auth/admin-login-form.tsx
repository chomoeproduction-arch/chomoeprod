"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? ((await response.json()) as { ok?: boolean; error?: string })
        : { ok: false, error: "تعذر إكمال طلب تسجيل الدخول." };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "فشل تسجيل الدخول.");
        return;
      }

      const nextPath = searchParams.get("next") || "/dashboard";
      window.location.assign(nextPath);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر تسجيل الدخول. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">دخول الإدارة</p>
        <h2>تسجيل الدخول لأعضاء الفريق</h2>
        <p className="muted-copy">
          استخدم حسابك الموجود داخل <strong>Supabase Auth</strong> فقط. لم يعد النظام يعتمد على جدول أعضاء منفصل.
        </p>
      </div>

      <label>
        البريد الإلكتروني
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>

      <label>
        كلمة المرور
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>

      <button type="submit" className="primary-action" disabled={loading}>
        {loading ? "جاري الدخول..." : "دخول لوحة التحكم"}
      </button>

      {error ? <p className="error-copy">{error}</p> : null}
    </form>
  );
}
