import { redirect } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { TeamManagement } from "@/components/dashboard/team-management";
import { requireSupabaseUser } from "@/lib/auth";
import { fetchCurrentUserTeamProfile, fetchTeamProfiles } from "@/lib/team";

export default async function TeamPage() {
  try {
    const { supabase, user } = await requireSupabaseUser();
    const isAdmin = user.user_metadata?.team_role === "admin";
    const currentMember = await fetchCurrentUserTeamProfile(user, supabase);
    const teamData = await fetchTeamProfiles();

    return (
      <main className="page-shell">
        <DashboardFrame currentMember={currentMember}>
          <TeamManagement initialMembers={teamData.members} setupRequired={teamData.setupRequired} canManage={isAdmin} />
        </DashboardFrame>
      </main>
    );
  } catch {
    redirect("/login");
  }
}
