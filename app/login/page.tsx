import { Suspense } from "react";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default function LoginPage() {
  return (
    <main className="page-shell login-page-shell">
      <section className="login-shell">
        <div className="login-intro">
          <p className="eyebrow">Admin Access</p>
          <h1>دخول الإدارة</h1>
          <p className="muted-copy">هذه الصفحة مخصصة لفريق Chomoe الداخلي فقط للوصول إلى لوحة مراجعة المرشحين.</p>
        </div>

        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </section>
    </main>
  );
}
