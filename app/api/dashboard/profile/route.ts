import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/auth";
import { buildCurrentProfileUpdate, getTeamProfileStorageErrorMessage, upsertTeamProfile } from "@/lib/team";

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireSupabaseUser();
    const payload = (await request.json()) as {
      fullName?: string;
      roleTitle?: string;
      department?: string;
      phone?: string;
      bio?: string;
      avatarUrl?: string;
      avatarPath?: string;
      password?: string;
    };

    const { profile, authMetadata } = buildCurrentProfileUpdate(user, payload);

    await upsertTeamProfile(supabase, user.id, profile, {
      email: user.email,
      fullName: profile.fullName,
    });

    const { error: authError } = await supabase.auth.updateUser({
      password: payload.password?.trim() || undefined,
      data: authMetadata,
    });

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      getTeamProfileStorageErrorMessage(error) ||
      (error instanceof Error ? error.message : "تعذر تحديث الملف الشخصي.");

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
