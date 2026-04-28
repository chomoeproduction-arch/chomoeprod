import { NextResponse } from "next/server";
import { buildAnswerRows } from "@/lib/crm";
import { type ApplicantProfile } from "@/lib/crm-data";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as ApplicantProfile;
  const supabase = await createClient();

  const [{ data: category }, { data: stage }] = await Promise.all([
    supabase.from("registration_categories").select("id").eq("slug", "technical").maybeSingle(),
    supabase.from("pipeline_stages").select("id").eq("slug", "new").maybeSingle(),
  ]);

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .insert({
      category_id: category?.id ?? null,
      stage_id: stage?.id ?? null,
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      whatsapp: body.phone,
      location: body.location,
      portfolio: body.portfolio,
      primary_stack: body.primaryStack,
      experience_years: body.experienceYears,
    })
    .select("id")
    .single();

  if (applicantError || !applicant) {
    return NextResponse.json(
      {
        ok: false,
        error: "تعذر حفظ طلب التقديم.",
      },
      { status: 400 }
    );
  }

  const answers = buildAnswerRows(applicant.id, body);
  const { error: answersError } = await supabase.from("applicant_answers").insert(answers);

  if (answersError) {
    return NextResponse.json(
      {
        ok: false,
        error: "تم حفظ مقدم الطلب لكن تعذر حفظ الإجابات التفصيلية.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
