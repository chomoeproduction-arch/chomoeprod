import { redirect } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { requireSupabaseUser } from "@/lib/auth";
import { fetchCurrentUserTeamProfile } from "@/lib/team";

export default async function ProfilePage() {
  try {
    const { supabase, user } = await requireSupabaseUser();
    const profile = await fetchCurrentUserTeamProfile(user, supabase);

    return (
      <main className="page-shell">
        <DashboardFrame currentMember={profile}>
          <ProfileSettings initialProfile={profile} />
        </DashboardFrame>
      </main>
    );
  } catch {
    redirect("/login");
  }
}
