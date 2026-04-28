export const pipelineStages = ["New", "Reviewed", "Contacted", "Interview", "Accepted", "Rejected"] as const;

export type PipelineStage = (typeof pipelineStages)[number];

export type EvaluationDecision = "Undecided" | "Strong Yes" | "Yes" | "Maybe" | "No";

export type Evaluation = {
  problemSolving: number;
  codeQuality: number;
  communication: number;
  systemThinking: number;
  aiUsage: number;
  decision: EvaluationDecision;
  summary: string;
};

export type NoteItem = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

export type CommunicationItem = {
  id: string;
  channel: "Phone" | "WhatsApp" | "Email";
  result: string;
  followUp: string;
  summary: string;
  createdAt: string;
  author: string;
};

export type ApplicantProfile = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolio: string;
  technicalFocus: string;
  primaryStack: string;
  experienceYears: string;
  recentSystems: string;
  performanceScenario: string;
  classificationThinking: string;
  unknownErrorSteps: string;
  apiUnderstanding: string;
  databaseRelationships: string;
  authDifference: string;
  rolesPermissionsDesign: string;
  miniCrmModules: string;
  crmExperience: string;
  crmVsErp: string;
  crmTopFeatures: string;
  codingPractices: string;
  gitAndApis: string;
  formFlowExplanation: string;
  aiUsage: string;
  aiValidation: string;
  aiExample: string;
  practicalLevel: string;
  practicalDelivery: string;
  deadlineApproach: string;
  weakCodeCollaboration: string;
  rewriteResponse: string;
  strengths: string;
  selfRatings: string;
  learningFocus: string;
  failureExperience: string;
};

export type DashboardApplicant = {
  id: string;
  category: {
    name: string;
    slug: string;
  } | null;
  stage: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
  } | null;
  assignee: {
    id: string;
    fullName: string;
    email: string | null;
    roleName: string | null;
  } | null;
  submittedAt: string;
  statusNote: string;
  profile: ApplicantProfile;
  notes: NoteItem[];
  communication: CommunicationItem[];
  evaluation: Evaluation;
};

export type TeamMember = {
  id: string;
  fullName: string;
  email: string | null;
  roleName: string | null;
};

export type StageOption = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export const emptyEvaluation: Evaluation = {
  problemSolving: 3,
  codeQuality: 3,
  communication: 3,
  systemThinking: 3,
  aiUsage: 3,
  decision: "Undecided",
  summary: "",
};

export const blankApplicantProfile: ApplicantProfile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  portfolio: "",
  technicalFocus: "",
  primaryStack: "",
  experienceYears: "",
  recentSystems: "",
  performanceScenario: "",
  classificationThinking: "",
  unknownErrorSteps: "",
  apiUnderstanding: "",
  databaseRelationships: "",
  authDifference: "",
  rolesPermissionsDesign: "",
  miniCrmModules: "",
  crmExperience: "",
  crmVsErp: "",
  crmTopFeatures: "",
  codingPractices: "",
  gitAndApis: "",
  formFlowExplanation: "",
  aiUsage: "",
  aiValidation: "",
  aiExample: "",
  practicalLevel: "",
  practicalDelivery: "",
  deadlineApproach: "",
  weakCodeCollaboration: "",
  rewriteResponse: "",
  strengths: "",
  selfRatings: "",
  learningFocus: "",
  failureExperience: "",
};

export const technicalSections = [
  {
    key: "identity-contact",
    title: "الهوية والتواصل",
    fields: [
      ["الاسم الكامل", "fullName"],
      ["البريد الإلكتروني", "email"],
      ["الهاتف / واتساب", "phone"],
      ["الولاية / البلدية", "location"],
      ["رابط الأعمال / GitHub / LinkedIn", "portfolio"],
    ],
  },
  {
    key: "technical-orientation",
    title: "التوجه التقني",
    fields: [
      ["المجال الأقوى", "technicalFocus"],
      ["التقنيات الأساسية", "primaryStack"],
      ["سنوات الخبرة", "experienceYears"],
      ["مشروع Production ودورك فيه", "recentSystems"],
    ],
  },
  {
    key: "problem-solving",
    title: "حل المشكلات",
    fields: [
      ["تشخيص بطء الصفحة الرئيسية", "performanceScenario"],
      ["الفرق بين Bug و Feature و Improvement", "classificationThinking"],
      ["أول 3 خطوات عند Error غير معروف", "unknownErrorSteps"],
    ],
  },
  {
    key: "system-thinking",
    title: "التفكير المنظومي",
    fields: [
      ["ما الذي تفهمه من API", "apiUnderstanding"],
      ["ما الذي تفهمه من Database Relationships", "databaseRelationships"],
      ["Authentication vs Authorization", "authDifference"],
      ["بناء Users / Roles / Permissions", "rolesPermissionsDesign"],
      ["تقسيم Mini CRM إلى Modules", "miniCrmModules"],
    ],
  },
  {
    key: "crm-erp-understanding",
    title: "فهم أنظمة CRM / ERP",
    fields: [
      ["خبرتك أو فهمك لـ CRM / ERP / POS", "crmExperience"],
      ["الفرق بين CRM و ERP", "crmVsErp"],
      ["أهم 3 Features في CRM", "crmTopFeatures"],
    ],
  },
  {
    key: "coding-practices",
    title: "ممارسات البرمجة",
    fields: [
      ["Clean Code: naming + structure", "codingPractices"],
      ["Git و APIs في شغلك اليومي", "gitAndApis"],
      ["معالجة Form من Frontend حتى Database", "formFlowExplanation"],
    ],
  },
  {
    key: "ai-usage",
    title: "استخدام الذكاء الاصطناعي",
    fields: [
      ["الأدوات التي تستخدمها وكيف", "aiUsage"],
      ["كيف تضمن صحة وأمن وصيانة كود AI", "aiValidation"],
      ["مثال نجاح وفشل مع AI", "aiExample"],
    ],
  },
  {
    key: "practical-test",
    title: "الاختبار العملي",
    fields: [
      ["المستوى الأنسب لك", "practicalLevel"],
      ["كيف ستنفذ وتسلم الاختبار", "practicalDelivery"],
    ],
  },
  {
    key: "work-simulation",
    title: "العمل تحت الضغط والانسجام مع الفريق",
    fields: [
      ["التصرف مع Deadline قريب وباغات", "deadlineApproach"],
      ["التعامل مع Dev كوده ضعيف", "weakCodeCollaboration"],
      ["ردك إذا قيل لك بدّل كل الكود", "rewriteResponse"],
    ],
  },
  {
    key: "self-evaluation",
    title: "التقييم الذاتي",
    fields: [
      ["أبرز نقاط القوة الحالية", "strengths"],
      ["تقييم نفسك من 10", "selfRatings"],
      ["ما الذي لو تعلمته الآن يرفع مستواك", "learningFocus"],
      ["تجربة فشل وما تعلمته منها", "failureExperience"],
    ],
  },
] as const;

export const questionFieldEntries = technicalSections.flatMap((section) =>
  section.fields.map(([label, key]) => ({
    sectionKey: section.key,
    questionLabel: label,
    questionKey: key,
  }))
);
