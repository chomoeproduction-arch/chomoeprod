import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/auth";
import { type Evaluation } from "@/lib/crm-data";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireSupabaseUser();
    const { id } = await context.params;
    const body = (await request.json()) as Evaluation;

    const { error } = await supabase.from("technical_evaluations").upsert(
      {
        applicant_id: id,
        problem_solving: body.problemSolving,
        code_quality: body.codeQuality,
        communication: body.communication,
        system_thinking: body.systemThinking,
        ai_usage: body.aiUsage,
        final_decision: body.decision,
        summary: body.summary,
      },
      { onConflict: "applicant_id" }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: "تعذر حفظ التقييم." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: "غير مصرح." }, { status });
  }
}
