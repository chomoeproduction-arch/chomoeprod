import {
  blankApplicantProfile,
  emptyEvaluation,
  questionFieldEntries,
  type ApplicantProfile,
  type DashboardApplicant,
  type Evaluation,
  type StageOption,
} from "@/lib/crm-data";
import { createClient } from "@/utils/supabase/server";

type SupabaseRecord = Record<string, unknown>;

type ApplicantBaseRecord = {
  id: string;
  category_id: string | null;
  stage_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  portfolio: string | null;
  primary_stack: string | null;
  experience_years: string | null;
  status_note: string | null;
  submitted_at: string | null;
};

type RelatedRow = SupabaseRecord & {
  applicant_id?: string;
};

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toIsoDate(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toIsoDateTime(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapProfile(applicant: SupabaseRecord, answers: SupabaseRecord[]): ApplicantProfile {
  const profile: ApplicantProfile = {
    ...blankApplicantProfile,
    fullName: asText(applicant.full_name),
    email: asText(applicant.email),
    phone: asText(applicant.phone || applicant.whatsapp),
    location: asText(applicant.location),
    portfolio: asText(applicant.portfolio),
    primaryStack: asText(applicant.primary_stack),
    experienceYears: asText(applicant.experience_years),
  };

  for (const answer of answers) {
    const key = answer.question_key;
    if (typeof key === "string" && key in profile) {
      profile[key as keyof ApplicantProfile] = asText(answer.answer_text) as never;
    }
  }

  return profile;
}

function mapEvaluation(raw: SupabaseRecord | undefined): Evaluation {
  if (!raw) {
    return emptyEvaluation;
  }

  return {
    problemSolving: Number(raw.problem_solving ?? emptyEvaluation.problemSolving),
    codeQuality: Number(raw.code_quality ?? emptyEvaluation.codeQuality),
    communication: Number(raw.communication ?? emptyEvaluation.communication),
    systemThinking: Number(raw.system_thinking ?? emptyEvaluation.systemThinking),
    aiUsage: Number(raw.ai_usage ?? emptyEvaluation.aiUsage),
    decision: (raw.final_decision as Evaluation["decision"]) ?? emptyEvaluation.decision,
    summary: asText(raw.summary),
  };
}

function mapAuthor(row: SupabaseRecord) {
  const name = asText(row.created_by_name);
  const email = asText(row.created_by_email);

  return name || email || "عضو فريق";
}

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  return code === "42703" || message.includes("created_by_") || message.includes("schema cache");
}

function mapApplicant(
  record: ApplicantBaseRecord,
  {
    category,
    stage,
    answers,
    notes,
    communication,
    evaluation,
  }: {
    category: { name: string; slug: string } | null;
    stage: { id: string; name: string; slug: string; sortOrder: number } | null;
    answers: SupabaseRecord[];
    notes: SupabaseRecord[];
    communication: SupabaseRecord[];
    evaluation?: SupabaseRecord;
  }
): DashboardApplicant {
  return {
    id: asText(record.id),
    category,
    stage,
    assignee: null,
    submittedAt: toIsoDate(record.submitted_at),
    statusNote: asText(record.status_note),
    profile: mapProfile(record as unknown as SupabaseRecord, answers),
    notes: notes.map((note) => ({
      id: asText(note.id),
      text: asText(note.note_text),
      createdAt: toIsoDateTime(note.created_at),
      author: mapAuthor(note),
    })),
    communication: communication.map((item) => ({
      id: asText(item.id),
      channel: asText(item.channel) as "Phone" | "WhatsApp" | "Email",
      result: asText(item.result),
      summary: asText(item.summary),
      followUp: toIsoDate(item.follow_up_at),
      createdAt: toIsoDateTime(item.created_at),
      author: mapAuthor(item),
    })),
    evaluation: mapEvaluation(evaluation),
  };
}

function groupRowsByApplicant(rows: RelatedRow[] | null | undefined) {
  const grouped = new Map<string, SupabaseRecord[]>();

  for (const row of rows ?? []) {
    const applicantId = typeof row.applicant_id === "string" ? row.applicant_id : "";
    if (!applicantId) continue;
    const current = grouped.get(applicantId) ?? [];
    current.push(row);
    grouped.set(applicantId, current);
  }

  return grouped;
}

export async function fetchHomeSnapshot() {
  const supabase = await createClient();

  const [{ data: categories }, { data: stages }] = await Promise.all([
    supabase.from("registration_categories").select("id, name, description").eq("is_active", true),
    supabase.from("pipeline_stages").select("id, name").order("sort_order"),
  ]);

  return {
    categoriesCount: categories?.length ?? 0,
    stagesCount: stages?.length ?? 0,
    membersCount: 0,
    categories:
      categories?.map((item) => ({
        id: asText(item.id),
        name: asText(item.name),
        description: asText(item.description),
      })) ?? [],
  };
}

export async function fetchDashboardData() {
  const supabase = await createClient();

  const [applicantsResult, stagesResult, categoriesResult, answersResult, notesResult, communicationResult, evaluationsResult] = await Promise.all([
    supabase
      .from("applicants")
      .select(
        "id, category_id, stage_id, full_name, email, phone, whatsapp, location, portfolio, primary_stack, experience_years, status_note, submitted_at"
      )
      .order("submitted_at", { ascending: false }),
    supabase.from("pipeline_stages").select("id, name, slug, sort_order").order("sort_order"),
    supabase.from("registration_categories").select("id, name, slug"),
    supabase.from("applicant_answers").select("applicant_id, section_key, question_key, question_label, answer_text"),
    supabase
      .from("applicant_notes")
      .select("id, applicant_id, note_text, created_at, created_by_user_id, created_by_name, created_by_email")
      .order("created_at", { ascending: false }),
    supabase
      .from("communication_logs")
      .select("id, applicant_id, channel, result, summary, follow_up_at, created_at, created_by_user_id, created_by_name, created_by_email")
      .order("created_at", { ascending: false }),
    supabase
      .from("technical_evaluations")
      .select("applicant_id, problem_solving, code_quality, communication, system_thinking, ai_usage, final_decision, summary"),
  ]);

  if (applicantsResult.error) {
    throw applicantsResult.error;
  }

  if (stagesResult.error) {
    throw stagesResult.error;
  }

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }

  if (answersResult.error) {
    throw answersResult.error;
  }

  let notesData: SupabaseRecord[] | null = (notesResult.data ?? null) as SupabaseRecord[] | null;
  let communicationData: SupabaseRecord[] | null = (communicationResult.data ?? null) as SupabaseRecord[] | null;

  if (notesResult.error && isMissingColumnError(notesResult.error)) {
    const fallback = await supabase
      .from("applicant_notes")
      .select("id, applicant_id, note_text, created_at")
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw fallback.error;
    }

    notesData = (fallback.data ?? null) as SupabaseRecord[] | null;
  } else if (notesResult.error) {
    throw notesResult.error;
  }

  if (communicationResult.error && isMissingColumnError(communicationResult.error)) {
    const fallback = await supabase
      .from("communication_logs")
      .select("id, applicant_id, channel, result, summary, follow_up_at, created_at")
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw fallback.error;
    }

    communicationData = (fallback.data ?? null) as SupabaseRecord[] | null;
  } else if (communicationResult.error) {
    throw communicationResult.error;
  }

  if (evaluationsResult.error) {
    throw evaluationsResult.error;
  }

  const stagesById = new Map(
    (stagesResult.data ?? []).map((stage) => [
      asText(stage.id),
      {
        id: asText(stage.id),
        name: asText(stage.name),
        slug: asText(stage.slug),
        sortOrder: Number(stage.sort_order ?? 0),
      },
    ])
  );

  const categoriesById = new Map(
    (categoriesResult.data ?? []).map((category) => [
      asText(category.id),
      {
        name: asText(category.name),
        slug: asText(category.slug),
      },
    ])
  );

  const answersByApplicant = groupRowsByApplicant((answersResult.data ?? []) as RelatedRow[]);
  const notesByApplicant = groupRowsByApplicant((notesData ?? []) as RelatedRow[]);
  const communicationByApplicant = groupRowsByApplicant((communicationData ?? []) as RelatedRow[]);
  const evaluationByApplicant = new Map(
    ((evaluationsResult.data ?? []) as RelatedRow[]).map((row) => [asText(row.applicant_id), row])
  );

  return {
    applicants: ((applicantsResult.data ?? []) as ApplicantBaseRecord[]).map((item) =>
      mapApplicant(item, {
        category: categoriesById.get(asText(item.category_id)) ?? null,
        stage: stagesById.get(asText(item.stage_id)) ?? null,
        answers: answersByApplicant.get(asText(item.id)) ?? [],
        notes: notesByApplicant.get(asText(item.id)) ?? [],
        communication: communicationByApplicant.get(asText(item.id)) ?? [],
        evaluation: evaluationByApplicant.get(asText(item.id)),
      })
    ),
    stages: (stagesResult.data ?? []).map(
      (stage): StageOption => ({
        id: asText(stage.id),
        name: asText(stage.name),
        slug: asText(stage.slug),
        sortOrder: Number(stage.sort_order ?? 0),
      })
    ),
    teamMembers: [],
  };
}

export function buildAnswerRows(applicantId: string, profile: ApplicantProfile) {
  return questionFieldEntries.map((entry) => ({
    applicant_id: applicantId,
    section_key: entry.sectionKey,
    question_key: entry.questionKey,
    question_label: entry.questionLabel,
    answer_text: profile[entry.questionKey as keyof ApplicantProfile],
  }));
}
