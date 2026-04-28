"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import algeriaLocations from "@/lib/algeria-locations.json";
import { blankApplicantProfile, type ApplicantProfile } from "@/lib/crm-data";

const focusOptions = [
  "Frontend (واجهات)",
  "Backend (أنظمة و APIs)",
  "Full-stack",
  "DevOps / Infrastructure",
];

const experienceOptions = ["0-1 سنوات", "1-3 سنوات", "3-5 سنوات", "5+ سنوات"];

const practicalLevels = [
  "Level 1: Landing Page + Responsive + Form",
  "Level 2: Landing Page + Form + API + Storage",
];

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile.technicalFocus || !profile.practicalLevel || !selectedWilayaCode || !selectedCommuneName) {
      setError("يرجى إكمال اختيارات الولاية والبلدية، وكذلك الأسئلة التي تحتوي على مربعات تحديد.");
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
    setSubmitted(true);
    setLoading(false);

    window.setTimeout(() => {
      router.refresh();
    }, 600);
  }

  return (
    <form className="application-form application-form-rich" onSubmit={handleSubmit}>
      <section className="form-section">
        <div className="section-title">
          <span className="section-index">01</span>
          <div>
            <h3>المعلومات الأساسية</h3>
            <p>بيانات التواصل الأساسية ورابط أعمالك إن وجد.</p>
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
              <option value="">{selectedWilaya ? "اختر البلدية" : "اختر الولاية أولاً"}</option>
              {communes.map((commune) => (
                <option key={`${selectedWilaya?.code}-${commune.name}`} value={commune.name}>
                  {commune.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          رابط الأعمال / GitHub / LinkedIn
          <input value={profile.portfolio} onChange={(event) => updateField("portfolio", event.target.value)} />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">02</span>
          <div>
            <h3>التوجه التقني</h3>
            <p>نريد نعرف المجال الذي ترتاح فيه فعليًا، والتقنيات التي تستعملها في الواقع.</p>
          </div>
        </div>

        <ChoiceGroup
          legend="في أي مجال تعتبر نفسك أقوى؟"
          name="technicalFocus"
          value={profile.technicalFocus}
          options={focusOptions}
          onChange={(value) => updateField("technicalFocus", value)}
        />

        <div className="field-grid two">
          <label>
            ما هي التقنيات التي تستعملها فعليًا؟
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
          هل سبق وخدمت على مشروع Production؟ صفه بإيجاز + دورك فيه.
          <textarea
            required
            rows={5}
            value={profile.recentSystems}
            onChange={(event) => updateField("recentSystems", event.target.value)}
            placeholder="نوع المشروع، من كان يستعمله، وما الذي كنت مسؤولًا عنه."
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">03</span>
          <div>
            <h3>التفكير البرمجي</h3>
            <p>هذا القسم يهمنا فيه أسلوبك في التشخيص والتنفيذ، وليس فقط الجواب النظري.</p>
          </div>
        </div>

        <label>
          إذا جاك سيناريو: "الموقع فيه بطء كبير عند تحميل الصفحة الرئيسية" كيفاش تبدأ تحل المشكلة؟
          <textarea
            required
            rows={5}
            value={profile.performanceScenario}
            onChange={(event) => updateField("performanceScenario", event.target.value)}
          />
        </label>

        <label>
          كيف تفرق بين Bug و Feature و Improvement؟
          <textarea
            required
            rows={4}
            value={profile.classificationThinking}
            onChange={(event) => updateField("classificationThinking", event.target.value)}
          />
        </label>

        <label>
          لما تواجه Error ما تعرفوش، واش أول 3 خطوات تديرهم؟
          <textarea
            required
            rows={4}
            value={profile.unknownErrorSteps}
            onChange={(event) => updateField("unknownErrorSteps", event.target.value)}
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">04</span>
          <div>
            <h3>هندسة الأنظمة</h3>
            <p>أجب بطريقة عملية وبسيطة، كأنك تشرح لفريق سيبني معك النظام.</p>
          </div>
        </div>

        <div className="field-grid two">
          <label>
            واش تفهم من API؟
            <textarea required rows={4} value={profile.apiUnderstanding} onChange={(event) => updateField("apiUnderstanding", event.target.value)} />
          </label>
          <label>
            واش تفهم من Database Relationships؟
            <textarea
              required
              rows={4}
              value={profile.databaseRelationships}
              onChange={(event) => updateField("databaseRelationships", event.target.value)}
            />
          </label>
        </div>

        <label>
          اشرح الفرق بين Authentication و Authorization.
          <textarea required rows={4} value={profile.authDifference} onChange={(event) => updateField("authDifference", event.target.value)} />
        </label>

        <label>
          كيفاش تبني نظام بسيط فيه Users و Roles و Permissions؟
          <textarea
            required
            rows={5}
            value={profile.rolesPermissionsDesign}
            onChange={(event) => updateField("rolesPermissionsDesign", event.target.value)}
          />
        </label>

        <label>
          لو طلبنا منك تبني Mini CRM، كيفاش تقسمه Modules؟
          <textarea required rows={5} value={profile.miniCrmModules} onChange={(event) => updateField("miniCrmModules", event.target.value)} />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">05</span>
          <div>
            <h3>ERP / CRM Mindset</h3>
            <p>لسنا نبحث عن تعريفات مدرسية، بل عن فهمك لكيف تُستخدم هذه الأنظمة فعليًا.</p>
          </div>
        </div>

        <label>
          هل سبق وخدمت أو درست CRM أو ERP أو POS؟ اشرح وش فهمت منهم.
          <textarea required rows={5} value={profile.crmExperience} onChange={(event) => updateField("crmExperience", event.target.value)} />
        </label>

        <div className="field-grid two">
          <label>
            في رأيك، ما الفرق بين CRM و ERP؟
            <textarea required rows={4} value={profile.crmVsErp} onChange={(event) => updateField("crmVsErp", event.target.value)} />
          </label>
          <label>
            إذا تبني CRM، وش أهم 3 Features لازم يكونو فيه؟
            <textarea required rows={4} value={profile.crmTopFeatures} onChange={(event) => updateField("crmTopFeatures", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">06</span>
          <div>
            <h3>الكود الحقيقي</h3>
            <p>ركز على كيف تخدم أنت فعليًا: تنظيم، Git، APIs، وتدفق البيانات من الواجهة إلى قاعدة البيانات.</p>
          </div>
        </div>

        <label>
          هل تكتب Clean Code؟ أعط مثال على Naming و Structure.
          <textarea required rows={5} value={profile.codingPractices} onChange={(event) => updateField("codingPractices", event.target.value)} />
        </label>

        <label>
          هل تستعمل Git و APIs؟ اشرح كيفاش تخدم بهما عادةً.
          <textarea required rows={4} value={profile.gitAndApis} onChange={(event) => updateField("gitAndApis", event.target.value)} />
        </label>

        <label>
          مثال عملي: عندك Form تسجيل، كيفاش تعالج البيانات من Frontend حتى Database؟
          <textarea
            required
            rows={5}
            value={profile.formFlowExplanation}
            onChange={(event) => updateField("formFlowExplanation", event.target.value)}
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">07</span>
          <div>
            <h3>Vibe Coding / AI Usage</h3>
            <p>نريد فهم نضجك في استخدام AI: أين يفيدك، وأين يمكن أن يضللك.</p>
          </div>
        </div>

        <label>
          هل استعملت أدوات AI في البرمجة؟ كيف تستعملها؟
          <textarea required rows={4} value={profile.aiUsage} onChange={(event) => updateField("aiUsage", event.target.value)} />
        </label>

        <label>
          كيفاش تضمن أن الكود الناتج من AI صحيح وآمن وقابل للصيانة؟
          <textarea required rows={5} value={profile.aiValidation} onChange={(event) => updateField("aiValidation", event.target.value)} />
        </label>

        <label>
          أعط مثال وين AI ساعدك، ووين فشل معاك.
          <textarea required rows={4} value={profile.aiExample} onChange={(event) => updateField("aiExample", event.target.value)} />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">08</span>
          <div>
            <h3>الاختبار العملي</h3>
            <p>اختر المستوى المناسب لك، ثم اشرح باختصار كيف تسلّم العمل بشكل منظم.</p>
          </div>
        </div>

        <ChoiceGroup
          legend="أي مستوى تفضّل؟"
          name="practicalLevel"
          value={profile.practicalLevel}
          options={practicalLevels}
          onChange={(value) => updateField("practicalLevel", value)}
        />

        <label>
          كيفاش تنفذ وتسلم هذا الاختبار؟
          <textarea
            required
            rows={4}
            value={profile.practicalDelivery}
            onChange={(event) => updateField("practicalDelivery", event.target.value)}
            placeholder="مثلاً: تقسيم المهام، Git workflow، API، التخزين، وكيف تتأكد أن كل شيء شغال."
          />
        </label>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">09</span>
          <div>
            <h3>الضغط والعمل الجماعي</h3>
            <p>كيف تتصرف حين يكون الوقت ضيقًا أو حين توجد اختلافات تقنية داخل الفريق.</p>
          </div>
        </div>

        <label>
          عندك Deadline غدوا، والمشروع فيه Bugs. كيفاش تتصرف؟
          <textarea required rows={4} value={profile.deadlineApproach} onChange={(event) => updateField("deadlineApproach", event.target.value)} />
        </label>

        <div className="field-grid two">
          <label>
            كيفاش تتعامل مع Dev آخر كودو ضعيف؟
            <textarea
              required
              rows={4}
              value={profile.weakCodeCollaboration}
              onChange={(event) => updateField("weakCodeCollaboration", event.target.value)}
            />
          </label>
          <label>
            إذا Lead قالك "بدّل كل الكود"، وش يكون ردك؟
            <textarea required rows={4} value={profile.rewriteResponse} onChange={(event) => updateField("rewriteResponse", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-title">
          <span className="section-index">10</span>
          <div>
            <h3>التقييم الذاتي</h3>
            <p>هذا القسم يساعدنا نفهم وعيك بنفسك وكيف تتطور، وليس فقط مستواك الحالي.</p>
          </div>
        </div>

        <label>
          ما أبرز نقاط قوتك اليوم؟
          <textarea required rows={4} value={profile.strengths} onChange={(event) => updateField("strengths", event.target.value)} />
        </label>

        <label>
          قيّم نفسك من 10 في Problem Solving و Code Quality و Speed، مع سبب مختصر.
          <textarea
            required
            rows={4}
            value={profile.selfRatings}
            onChange={(event) => updateField("selfRatings", event.target.value)}
            placeholder="مثال: Problem Solving 8/10 ... Code Quality 7/10 ... Speed 6/10 ..."
          />
        </label>

        <label>
          ما الحاجة التي لو تتعلمها الآن، ترفع مستواك مباشرة؟
          <textarea required rows={4} value={profile.learningFocus} onChange={(event) => updateField("learningFocus", event.target.value)} />
        </label>

        <label>
          اشرح مشروع تقني فشلت فيه، ووش تعلمت منه.
          <textarea required rows={5} value={profile.failureExperience} onChange={(event) => updateField("failureExperience", event.target.value)} />
        </label>
      </section>

      <div className="form-actions">
        <button type="submit" className="primary-action" disabled={loading}>
          {loading ? "جاري إرسال الملف..." : "إرسال ملف الترشح"}
        </button>
        {submitted ? <p className="submission-feedback success">تم إرسال الترشح بنجاح.</p> : null}
        {error ? <p className="error-copy">{error}</p> : null}
      </div>
    </form>
  );
}
