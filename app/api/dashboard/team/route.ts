import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/auth";
import { buildMinimalAuthMetadata, getTeamProfileStorageErrorMessage, upsertTeamProfile } from "@/lib/team";
import { createAdminClient, hasSupabaseAdminAccess } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { user } = await requireSupabaseUser();

    if (!hasSupabaseAdminAccess()) {
      return NextResponse.json(
        { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY غير مضبوط بعد. لا يمكن إنشاء مستخدمين في Auth." },
        { status: 500 }
      );
    }

    if (user.user_metadata?.team_role !== "admin") {
      return NextResponse.json({ ok: false, error: "غير مسموح لك بإضافة أعضاء الفريق." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      fullName?: string;
      email?: string;
      roleTitle?: string;
      teamRole?: string;
      department?: string;
      phone?: string;
      bio?: string;
      avatarUrl?: string;
      avatarPath?: string;
      status?: "active" | "inactive";
      password?: string;
    };

    const supabase = createAdminClient();
    const email = payload.email?.trim() || "";
    const fullName = payload.fullName?.trim() || "New Member";
    const authMetadata = buildMinimalAuthMetadata({
      fullName,
      email,
      teamRole: payload.teamRole,
      status: payload.status,
    });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: payload.password?.trim() || "TempPass#2026",
      email_confirm: true,
      user_metadata: authMetadata,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      await upsertTeamProfile(supabase, data.user.id, payload, {
        email,
        fullName,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      getTeamProfileStorageErrorMessage(error) ||
      (error instanceof Error ? error.message : "تعذر إضافة عضو الفريق.");

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
