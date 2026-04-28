import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireSupabaseUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      stageId?: string | null;
      statusNote?: string;
    };

    const payload: Record<string, string | null> = {};

    if ("stageId" in body) {
      payload.stage_id = body.stageId ?? null;
    }

    if ("statusNote" in body) {
      payload.status_note = body.statusNote ?? "";
    }

    const { error } = await supabase.from("applicants").update(payload).eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: "تعذر تحديث بيانات المرشح." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: "غير مصرح." }, { status });
  }
}
