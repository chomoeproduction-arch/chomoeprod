import Image from "next/image";
import { TechnicalApplicationForm } from "@/components/forms/technical-application-form";

const highlights = [
  "التسجيل صار في خطوتين فقط حتى يكون أسهل وأوضح.",
  "الصفحة الأولى للمعلومات الأساسية والجانب التقني ببساطة.",
  "الصفحة الثانية لفهم طريقتك، وليست اختبارًا نهائيًا.",
];

export default function TechnicalApplicationPage() {
  return (
    <main className="page-shell public-shell">
      <section className="application-hero">
        <div className="application-hero-copy">
          <div className="hero-logo-row">
            <div className="hero-logo-badge">
              <Image src="/chomoe-logo.svg" alt="Chomoe logo" width={56} height={56} priority />
            </div>
            <div>
              <p className="eyebrow">Chomoe Tech Team</p>
              <span className="hero-kicker">Technical Hiring Flow</span>
            </div>
          </div>

          <h1>تسجيل الفريق التقني</h1>
          <p className="hero-text">
            هذا النموذج يساعدنا نفهم مستواك وطريقة تفكيرك بدون ضغط. خذ وقتك، واكتب إجابات صادقة ومباشرة بدل محاولة
            تقديم إجابات مثالية.
          </p>
        </div>

        <div className="application-hero-panel">
          <span className="hero-badge">مسار التقديم التقني</span>
          <h2>خطوتان واضحتان بدل نموذج طويل</h2>
          <div className="hero-points">
            {highlights.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="form-intro-grid">
        <article className="intro-card intro-card-strong">
          <span className="intro-step">01</span>
          <h3>ابدأ بالأساسيات</h3>
          <p>املأ بيانات التواصل، الولاية والبلدية، والتقنيات التي تستعملها فعليًا.</p>
        </article>
        <article className="intro-card">
          <span className="intro-step">02</span>
          <h3>اختر بدل ما تكتب كثيرًا</h3>
          <p>حوّلنا جزءًا من الأسئلة إلى اختيارات حتى لا يأخذ التسجيل وقتًا طويلًا.</p>
        </article>
        <article className="intro-card">
          <span className="intro-step">03</span>
          <h3>اشرح ما تعرفه</h3>
          <p>الأسئلة المعمقة هدفها فهم تجربتك وطريقة تفكيرك، وليس الحكم عليك كاختبار مدرسي.</p>
        </article>
      </section>

      <TechnicalApplicationForm />
    </main>
  );
}
