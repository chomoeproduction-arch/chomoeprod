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
    key: "basic-technical-profile",
    title: "الملف التقني الأساسي",
    fields: [
      ["الجوانب التي يرتاح لها المرشح", "technicalFocus"],
      ["التقنيات التي يستعملها فعليًا", "primaryStack"],
      ["سنوات الخبرة التقريبية", "experienceYears"],
      ["مشروع أو تجربة قريبة", "recentSystems"],
    ],
  },
  {
    key: "practical-comfort",
    title: "المفاهيم وطريقة العمل",
    fields: [
      ["المفاهيم التي عنده معها تجربة", "databaseRelationships"],
      ["كيف ينظم خدمته عادة", "codingPractices"],
      ["استعمال الذكاء الاصطناعي", "aiUsage"],
    ],
  },
  {
    key: "deeper-understanding",
    title: "أسئلة الفهم والتفكير",
    fields: [
      ["معالجة Form من Frontend حتى Database", "formFlowExplanation"],
      ["تشخيص بطء صفحة في الموقع", "performanceScenario"],
      ["التحقق من كود AI", "aiValidation"],
      ["التصرف مع Deadline قريب وباغات", "deadlineApproach"],
      ["أبرز نقاط القوة الحالية", "strengths"],
      ["ما الذي لو تعلمته الآن يرفع مستواك", "learningFocus"],
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
