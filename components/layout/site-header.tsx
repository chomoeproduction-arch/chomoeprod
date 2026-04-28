import Link from "next/link";

type SiteHeaderProps = {
  current?: "home" | "apply" | "login" | "dashboard";
};

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark">CP</div>
        <div>
          <p className="eyebrow">Chomoe Production</p>
          <h1>منصة التقديم وإدارة المرشحين</h1>
        </div>
      </div>

      <nav className="topnav">
        <Link href="/" className={`nav-link ${current === "home" ? "nav-link-strong" : ""}`}>
          الرئيسية
        </Link>
        <Link href="/apply/technical" className={`nav-link ${current === "apply" ? "nav-link-strong" : ""}`}>
          نموذج التقديم
        </Link>
        <Link href="/dashboard" className={`nav-link ${current === "dashboard" ? "nav-link-strong" : ""}`}>
          لوحة التحكم
        </Link>
        <Link href="/login" className={`nav-link ${current === "login" ? "nav-link-strong" : ""}`}>
          دخول الإدارة
        </Link>
      </nav>
    </header>
  );
}
