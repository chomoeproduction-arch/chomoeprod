import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import type { TeamProfile } from "@/lib/team";

type DashboardFrameProps = {
  children: ReactNode;
  onLogout?: () => void;
  currentMember?: TeamProfile;
};

export function DashboardFrame({ children, onLogout, currentMember }: DashboardFrameProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <DashboardSidebar onLogout={onLogout} currentMember={currentMember} />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
