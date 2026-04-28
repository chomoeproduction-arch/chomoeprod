import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/auth";
import { buildMinimalAuthMetadata, getTeamProfileStorageErrorMessage, upsertTeamProfile } from "@/lib/team";
import { createAdminClient, hasSupabaseAdminAccess } from "@/utils/supabase/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireSupabaseUser();

    if (!hasSupabaseAdminAccess()) {
      return NextResponse.json(
        { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط بعد. لا يمكن تعديل مستخدمي Auth." },
        { status: 500 }
      );
    }

    if (user.user_metadata?.team_role !== "admin") {
      return NextResponse.json({ ok: false, error: "غير مسموح لك بتعديل أعضاء الفريق." }, { status: 403 });
    }

    const { id } = await context.params;
    const payload = (await request.json()) as {
      fullName?: string;
      email?: string;
      teamRole?: string;
      roleTitle?: string;
      department?: string;
      phone?: string;
      bio?: string;
      avatarUrl?: string;
      avatarPath?: string;
      status?: "active" | "inactive";
      password?: string;
    };

    if (payload.password?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "لا يمكن تغيير كلمة مرور عضو آخر من صفحة الفريق. يمكن لكل عضو تغيير كلمة مروره من ملفه الشخصي فقط.",
        },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const email = payload.email?.trim() || undefined;
    const fullName = payload.fullName?.trim() || "Team Member";
    const authMetadata = buildMinimalAuthMetadata({
      fullName,
      email,
      teamRole: payload.teamRole,
      status: payload.status,
    });

    const { error } = await supabase.auth.admin.updateUserById(id, {
      email,
      user_metadata: authMetadata,
    });

    if (error) {
      throw error;
    }

    await upsertTeamProfile(supabase, id, payload, {
      email,
      fullName,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      getTeamProfileStorageErrorMessage(error) ||
      (error instanceof Error ? error.message : "تعذر تعديل عضو الفريق.");

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
