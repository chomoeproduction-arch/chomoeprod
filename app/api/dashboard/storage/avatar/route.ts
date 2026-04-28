import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/auth";
import { createAdminClient, hasSupabaseAdminAccess } from "@/utils/supabase/admin";

const bucket = "team-avatars";

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() : "png";
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSupabaseUser();

    if (!hasSupabaseAdminAccess()) {
      return NextResponse.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط بعد." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "profiles");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "لم يتم إرسال ملف صورة." }, { status: 400 });
    }

    const admin = createAdminClient();
    const bytes = await file.arrayBuffer();
    const extension = getFileExtension(file.name || "image.png");
    const path = `${folder}/${user.id}/${Date.now()}-${randomUUID()}.${extension}`;

    const { error: uploadError } = await admin.storage.from(bucket).upload(path, bytes, {
      contentType: file.type || "image/png",
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      ok: true,
      path,
      url: data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذر رفع الصورة." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireSupabaseUser();

    if (!hasSupabaseAdminAccess()) {
      return NextResponse.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط بعد." }, { status: 500 });
    }

    const payload = (await request.json()) as { path?: string };
    if (!payload.path?.trim()) {
      return NextResponse.json({ ok: false, error: "مسار الصورة مفقود." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.storage.from(bucket).remove([payload.path.trim()]);
    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذر حذف الصورة." },
      { status: 500 }
    );
  }
}
