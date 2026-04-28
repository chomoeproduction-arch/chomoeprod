import { NextResponse } from "next/server";
import { getActivityAuthor } from "@/lib/activity-author";
import { requireSupabaseUser } from "@/lib/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireSupabaseUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      channel?: "Phone" | "WhatsApp" | "Email";
      result?: string;
      summary?: string;
      followUp?: string;
    };

    if (!body.channel || !body.result?.trim()) {
      return NextResponse.json({ ok: false, error: "بيانات التواصل ناقصة." }, { status: 400 });
    }

    const author = getActivityAuthor(user);
    const { error } = await supabase.from("communication_logs").insert({
      applicant_id: id,
      channel: body.channel,
      result: body.result.trim(),
      summary: body.summary?.trim() ?? "",
      follow_up_at: body.followUp || null,
      created_by_user_id: author.userId,
      created_by_name: author.name,
      created_by_email: author.email,
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "تعذر حفظ سجل التواصل. تأكد من تشغيل migration أعمدة created_by في Supabase.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: "غير مصرح." }, { status });
  }
}
