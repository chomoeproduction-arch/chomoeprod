import Image from "next/image";
import { TechnicalApplicationForm } from "@/components/forms/technical-application-form";

const highlights = [
  "أسئلة مرتبة حسب التفكير، التنفيذ، والعمل الجماعي.",
  "جاوب بطريقتك الحقيقية وبأمثلة من تجاربك الفعلية.",
  "المهم عندنا هو الوضوح وطريقة التفكير أكثر من الكلام المنمق.",
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

          <h1>Technical Hiring Questionnaire</h1>
          <p className="hero-text">
            هذا النموذج مخصص لاختيار أعضاء الفريق التقني بناءً على التفكير، المهارات، والقدرة على التنفيذ. خذ وقتك في
            الإجابة، ونفضّل الوضوح والصدق على الإجابات المثالية.
          </p>
        </div>

        <div className="application-hero-panel">
          <span className="hero-badge">مسار التقديم التقني</span>
          <h2>استمارة واحدة واضحة للمترشح</h2>
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
          <h3>املأ النموذج بهدوء</h3>
          <p>الأسئلة منظمة على 10 محاور حتى تكون الإجابات أسهل عليك وأسهل على فريق التقييم.</p>
        </article>
        <article className="intro-card">
          <span className="intro-step">02</span>
          <h3>جاوب بطريقة عملية</h3>
          <p>نحن نهتم بكيفاش تفكر وتنفذ أكثر من العبارات العامة أو الإجابات المحفوظة.</p>
        </article>
        <article className="intro-card">
          <span className="intro-step">03</span>
          <h3>وضوح قبل كل شيء</h3>
          <p>لا تحتاج إجابات مثالية، بل نفضّل شرحًا صريحًا لطريقتك في التفكير والعمل والتنفيذ.</p>
        </article>
      </section>

      <TechnicalApplicationForm />
    </main>
  );
}
