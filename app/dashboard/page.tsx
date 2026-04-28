import { redirect } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSupabaseUser } from "@/lib/auth";
import { fetchDashboardData } from "@/lib/crm";
import { fetchCurrentUserTeamProfile } from "@/lib/team";

export default async function DashboardPage() {
  let currentMember;

  try {
    const { supabase, user } = await requireSupabaseUser();
    currentMember = await fetchCurrentUserTeamProfile(user, supabase);
  } catch {
    redirect("/login");
  }

  const data = await fetchDashboardData();

  return (
    <main className="page-shell">
      <DashboardFrame currentMember={currentMember}>
        <DashboardShell initialApplicants={data.applicants} stages={data.stages} />
      </DashboardFrame>
    </main>
  );
}
