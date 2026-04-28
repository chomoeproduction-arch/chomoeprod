import { NextResponse } from "next/server";
import { getActivityAuthor } from "@/lib/activity-author";
import { requireSupabaseUser } from "@/lib/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireSupabaseUser();
    const { id } = await context.params;
    const body = (await request.json()) as { text?: string };

    if (!body.text?.trim()) {
      return NextResponse.json({ ok: false, error: "الملاحظة فارغة." }, { status: 400 });
    }

    const author = getActivityAuthor(user);
    const { error } = await supabase.from("applicant_notes").insert({
      applicant_id: id,
      note_text: body.text.trim(),
      created_by_user_id: author.userId,
      created_by_name: author.name,
      created_by_email: author.email,
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "تعذر إضافة الملاحظة. تأكد من تشغيل migration أعمدة created_by في Supabase.",
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
