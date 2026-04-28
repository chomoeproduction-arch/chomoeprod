"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChartColumnBig, ChevronLeft, LayoutDashboard, LogOut, Settings2, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Candidates", href: "/dashboard#dashboard-registrations", icon: UsersRound },
  { label: "Reports", href: "/dashboard#dashboard-reports", icon: ChartColumnBig },
  { label: "Team", href: "/dashboard/team", icon: UsersRound },
  { label: "Profile", href: "/dashboard/profile", icon: Settings2 },
];

type DashboardSidebarProps = {
  onLogout?: () => void;
  currentMember?: {
    fullName: string;
    email: string;
    teamRole: string;
    avatarUrl: string;
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DashboardSidebar({ onLogout, currentMember }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const displayName = currentMember?.fullName || currentMember?.email?.split("@")[0] || "Team Member";
  const username = currentMember?.email?.split("@")[0] || currentMember?.teamRole || "team";

  async function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sticky top-6 hidden h-fit xl:block">
      <div className="rounded-[28px] border border-[#e1d7ca] bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="space-y-5 border-b border-[#eee5da] p-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <Image src="/chomoe-logo.svg" alt="Chomoe" width={38} height={38} className="h-9 w-9 object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d56d3b]">CHOMOE CRM</p>
              <h2 className="text-xl font-semibold text-[#1d2a43]">Recruitment Hub</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#eee5da] bg-[#fbf8f3] p-3">
            {currentMember?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentMember.avatarUrl}
                alt={displayName}
                className="size-12 rounded-2xl border border-white object-cover shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
              />
            ) : (
              <div className="grid size-12 place-items-center rounded-2xl bg-[#24324d] text-sm font-bold text-white shadow-[0_8px_18px_rgba(36,50,77,0.18)]">
                {getInitials(displayName) || "TM"}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#1d2a43]">{displayName}</p>
              <p className="truncate text-xs font-semibold text-[#7a8497]">@{username}</p>
            </div>
          </div>

          <div className="grid gap-2">
            {quickLinks.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : item.href === "/dashboard/team"
                    ? pathname === "/dashboard/team"
                    : item.href === "/dashboard/profile"
                      ? pathname === "/dashboard/profile"
                      : false;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-[#24324d] !text-white shadow-[0_14px_28px_rgba(36,50,77,0.22)] [&_svg]:text-white"
                      : "text-[#5c6577] hover:bg-[#f6f1ea] hover:text-[#1d2a43]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="size-4" />
                    {item.label}
                  </span>
                  <ChevronLeft className="size-4" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <Button variant="secondary" className="w-full justify-center" onClick={handleLogout}>
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
