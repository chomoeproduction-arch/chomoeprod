"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import algeriaLocations from "@/lib/algeria-locations.json";
import { blankApplicantProfile, type ApplicantProfile } from "@/lib/crm-data";

const focusOptions = [
  "Frontend (واجهات)",
  "Backend (أنظمة و APIs)",
  "Full-stack",
  "DevOps / Infrastructure",
  "UI / Responsive implementation",
];

const experienceOptions = ["0-1 سنوات", "1-3 سنوات", "3-5 سنوات", "5+ سنوات"];

const conceptOptions = [
  "APIs",
  "Database relationships",
  "Authentication / Authorization",
  "CRUD dashboards",
  "Roles / Permissions",
  "Deployment basics",
];

const workStyleOptions = [
  "أقسم المهمة لخطوات صغيرة",
  "نخدم بـ Git commits واضحة",
  "نراجع الكود قبل التسليم",
  "نختبر يدويًا قبل الإرسال",
  "نكتب أسماء وملفات منظمة",
];

const aiOptions = [
  "أستعمله للفهم والشرح",
  "أستعمله لتسريع كتابة الكود",
  "أراجعه قبل اعتماده",
  "أحتاج نتعلم كيف نتحقق منه أكثر",
];

type FormStep = "basics" | "deep";

type AlgeriaLocation = {
  code: string;
  wilayaName: string;
  wilayaNameAscii: string;
  communes: Array<{
    name: string;
    nameAscii: string;
  }>;
};

type ChoiceGroupProps = {
  legend: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

function toggleOption(currentValue: string, option: string) {
  const currentItems = currentValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (currentItems.includes(option)) {
    return currentItems.filter((item) => item !== option).join(", ");
  }

  return [...currentItems, option].join(", ");
}

function ChoiceGroup({ legend, name, value, options, onChange }: ChoiceGroupProps) {
  const selectedItems = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      <div className="choice-grid">
        {options.map((option) => (
          <label key={option} className={`choice-card ${selectedItems.includes(option) ? "choice-card-active" : ""}`}>
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selectedItems.includes(option)}
              onChange={() => onChange(toggleOption(value, option))}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TechnicalApplicationForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<ApplicantProfile>(blankApplicantProfile);
  const [selectedWilayaCode, setSelectedWilayaCode] = useState("");
  const [selectedCommuneName, setSelectedCommuneName] = useState("");
  const [currentStep, setCurrentStep] = useState<FormStep>("basics");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wilayas = algeriaLocations as AlgeriaLocation[];
  const selectedWilaya = wilayas.find((wilaya) => wilaya.code === selectedWilayaCode) ?? null;
  const communes = selectedWilaya?.communes ?? [];

  function updateField<K extends keyof ApplicantProfile>(key: K, value: ApplicantProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateLocation(nextWilayaCode: string, nextCommuneName: string) {
    const wilaya = wilayas.find((item) => item.code === nextWilayaCode);

    if (!wilaya || !nextCommuneName) {
      updateField("location", "");
      return;
    }

    updateField("location", `${wilaya.wilayaName} - ${nextCommuneName}`);
  }

  function handleWilayaChange(value: string) {
    setSelectedWilayaCode(value);
    setSelectedCommuneName("");
    updateLocation(value, "");
  }

  function handleCommuneChange(value: string) {
    setSelectedCommuneName(value);
    updateLocation(selectedWilayaCode, value);
  }

  function validateBasics() {
    if (
      !profile.fullName.trim() ||
      !profile.email.trim() ||
      !profile.phone.trim() ||
      !selectedWilayaCode ||
      !selectedCommuneName ||
      !profile.technicalFocus ||
      !profile.primaryStack.trim() ||
      !profile.experienceYears ||
      !profile.email.includes("@")
    ) {
      setError("يرجى إكمال المعلومات الأساسية والجانب التقني البسيط قبل الانتقال.");
      return false;
    }

    setError("");
    return true;
  }

  function hasDeepAnswer() {
    return [
      profile.databaseRelationships,
      profile.codingPractices,
      profile.aiUsage,
      profile.performanceScenario,
      profile.formFlowExplanation,
      profile.deadlineApproach,
      profile.strengths,
      profile.learningFocus,
      profile.aiValidation,
    ].some((answer) => answer.trim().length > 0);
  }

  function moveToStep(step: FormStep) {
    if (step === "deep" && !validateBasics()) {
      return;
    }

    setCurrentStep(step);
    setError("");
    window.requestAnimationFrame(() => {
      document.querySelector(".application-form-rich")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateBasics()) {
      setCurrentStep("basics");
      setSubmitted(false);
      return;
    }

    if (!hasDeepAnswer()) {
      setCurrentStep("deep");
      setError("الصفحة الثانية ليست اختبارًا، لكن نحتاج جوابًا واحدًا على الأقل حتى نفهم طريقتك.");
      setSubmitted(false);
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setError("");

    const response = await fetch("/api/applications/technical", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "تعذر إرسال الطلب.");
      setLoading(false);
      return;
    }

    setProfile(blankApplicantProfile);
    setSelectedWilayaCode("");
    setSelectedCommuneName("");
    setCurrentStep("basics");
    setSubmitted(true);
    setLoading(false);

    window.setTimeout(() => {
      router.refresh();
    }, 600);
  }

  return (
    <form className="application-form application-form-rich" onSubmit={handleSubmit}>
      <div className="application-stepper" aria-label="خطوات التسجيل">
        <div className={`step-indicator ${currentStep === "basics" ? "step-indicator-active" : "step-indicator-complete"}`}>
          <span>01</span>
          <strong>المعلومات الأساسية</strong>
        </div>
        <div className={`step-indicator ${currentStep === "deep" ? "step-indicator-active" : ""}`}>
          <span>02</span>
          <strong>أسئلة الفهم</strong>
        </div>
      </div>

      {currentStep === "basics" ? (
        <section className="form-section application-slide">
          <div className="section-title">
            <span className="section-index">01</span>
            <div>
              <h3>المعلومات الأساسية والجانب التقني</h3>
              <p>هذه الصفحة تجمع بيانات التواصل وما تعرفه تقنيًا بطريقة مختصرة وواضحة.</p>
            </div>
          </div>

          <div className="field-grid two">
            <label>
              الاسم الكامل
              <input required value={profile.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
            </label>
            <label>
              البريد الإلكتروني
              <input type="email" required value={profile.email} onChange={(event) => updateField("email", event.target.value)} />
            </label>
            <label>
              الهاتف / واتساب
              <input required value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </label>
            <label>
              الولاية
              <select required value={selectedWilayaCode} onChange={(event) => handleWilayaChange(event.target.value)}>
                <option value="">اختر الولاية</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.code} value={wilaya.code}>
                    {wilaya.code} - {wilaya.wilayaName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              البلدية
              <select required value={selectedCommuneName} onChange={(event) => handleCommuneChange(event.target.value)} disabled={!selectedWilaya}>
                <option value="">{selectedWilaya ? "اختر البلدية" : "اختر الولاية أولًا"}</option>
                {communes.map((commune) => (
                  <option key={`${selectedWilaya?.code}-${commune.name}`} value={commune.name}>
                    {commune.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              رابط أعمالك إن وجد
              <input value={profile.portfolio} onChange={(event) => updateField("portfolio", event.target.value)} placeholder="GitHub, LinkedIn, Portfolio..." />
            </label>
          </div>

          <ChoiceGroup
            legend="في أي جانب ترتاح أكثر؟ يمكن اختيار أكثر من خيار."
            name="technicalFocus"
            value={profile.technicalFocus}
            options={focusOptions}
            onChange={(value) => updateField("technicalFocus", value)}
          />

          <div className="field-grid two">
            <label>
              التقنيات التي تستعملها فعليًا
              <input
                required
                value={profile.primaryStack}
                onChange={(event) => updateField("primaryStack", event.target.value)}
                placeholder="React, Laravel, Node.js, PostgreSQL..."
              />
            </label>
            <label>
              سنوات الخبرة التقريبية
              <select required value={profile.experienceYears} onChange={(event) => updateField("experienceYears", event.target.value)}>
                <option value="">اختر</option>
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            مشروع أو تجربة قريبة خدمت عليها
            <textarea
              rows={4}
              value={profile.recentSystems}
              onChange={(event) => updateField("recentSystems", event.target.value)}
              placeholder="اختياري: نوع المشروع، دورك، والتقنيات التي استعملتها."
            />
          </label>
        </section>
      ) : (
        <section className="form-section application-slide">
          <div className="section-title">
            <span className="section-index">02</span>
            <div>
              <h3>أسئلة معمقة قليلًا</h3>
              <p>الهدف معرفة ما تعرف وكيف تفكر، وليس اختبارك أو اصطياد أخطائك. جاوب بصدق وباختصار.</p>
            </div>
          </div>

          <div className="form-note">
            <CheckCircle2 aria-hidden="true" />
            <p>يمكنك ترك بعض الأسئلة فارغة. المهم أن تعطينا على الأقل جوابًا واحدًا يوضح طريقة تفكيرك.</p>
          </div>

          <ChoiceGroup
            legend="المفاهيم التي عندك معها تجربة أو فهم مبدئي"
            name="databaseRelationships"
            value={profile.databaseRelationships}
            options={conceptOptions}
            onChange={(value) => updateField("databaseRelationships", value)}
          />

          <ChoiceGroup
            legend="كيف تنظم خدمتك عادة؟"
            name="codingPractices"
            value={profile.codingPractices}
            options={workStyleOptions}
            onChange={(value) => updateField("codingPractices", value)}
          />

          <ChoiceGroup
            legend="استعمالك للذكاء الاصطناعي في البرمجة"
            name="aiUsage"
            value={profile.aiUsage}
            options={aiOptions}
            onChange={(value) => updateField("aiUsage", value)}
          />

          <div className="question-stack">
            <label>
              إذا كانت صفحة في الموقع بطيئة، كيف تبدأ التشخيص؟
              <textarea
                rows={4}
                value={profile.performanceScenario}
                onChange={(event) => updateField("performanceScenario", event.target.value)}
                placeholder="مثال: نفتح DevTools، نشوف الشبكة، حجم الصور، الاستعلامات..."
              />
            </label>

            <label>
              عندك Form تسجيل، كيف تمر البيانات من الواجهة حتى قاعدة البيانات؟
              <textarea
                rows={4}
                value={profile.formFlowExplanation}
                onChange={(event) => updateField("formFlowExplanation", event.target.value)}
                placeholder="اشرحها بطريقتك، ولو بمثال بسيط."
              />
            </label>

            <label>
              كيف تتأكد أن كود خرج من AI صحيح وقابل للصيانة؟
              <textarea
                rows={4}
                value={profile.aiValidation}
                onChange={(event) => updateField("aiValidation", event.target.value)}
                placeholder="اختياري، لكن يساعدنا نفهم طريقة تعاملك مع الأدوات."
              />
            </label>

            <div className="field-grid two">
              <label>
                إذا كان Deadline قريب وفيه Bugs، ماذا تفعل أولًا؟
                <textarea rows={4} value={profile.deadlineApproach} onChange={(event) => updateField("deadlineApproach", event.target.value)} />
              </label>
              <label>
                ما أقوى نقطة عندك اليوم؟
                <textarea rows={4} value={profile.strengths} onChange={(event) => updateField("strengths", event.target.value)} />
              </label>
            </div>

            <label>
              ما الشيء الذي لو تتعلمه الآن يرفع مستواك بسرعة؟
              <textarea rows={4} value={profile.learningFocus} onChange={(event) => updateField("learningFocus", event.target.value)} />
            </label>
          </div>
        </section>
      )}

      <div className="form-actions form-actions-between">
        {currentStep === "deep" ? (
          <button type="button" className="secondary-action" onClick={() => moveToStep("basics")} disabled={loading}>
            <span className="icon-button-content">
              <ArrowRight aria-hidden="true" size={18} />
              رجوع
            </span>
          </button>
        ) : (
          <span />
        )}

        {currentStep === "basics" ? (
          <button type="button" className="primary-action" onClick={() => moveToStep("deep")}>
            <span className="icon-button-content">
              التالي
              <ArrowLeft aria-hidden="true" size={18} />
            </span>
          </button>
        ) : (
          <button type="submit" className="primary-action" disabled={loading}>
            <span className="icon-button-content">
              {loading ? "جاري إرسال الملف..." : "إرسال ملف الترشح"}
              <CheckCircle2 aria-hidden="true" size={18} />
            </span>
          </button>
        )}
      </div>

      {submitted ? <p className="submission-feedback success">تم إرسال الترشح بنجاح.</p> : null}
      {error ? <p className="error-copy">{error}</p> : null}
    </form>
  );
}
