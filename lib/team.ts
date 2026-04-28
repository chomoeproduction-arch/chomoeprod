import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient, hasSupabaseAdminAccess } from "@/utils/supabase/admin";

export type TeamProfile = {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  teamRole: string;
  roleTitle: string;
  department: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  avatarPath: string;
  status: "active" | "inactive";
};

export type TeamProfilesResult = {
  members: TeamProfile[];
  setupRequired: boolean;
  setupMessage?: string;
};

export type TeamProfileInput = {
  fullName?: string;
  email?: string | null;
  teamRole?: string;
  roleTitle?: string;
  department?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  avatarPath?: string;
  status?: "active" | "inactive" | string;
};

type TeamProfileRow = {
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  role_title: string | null;
  department: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  status: string | null;
};

const profileSelect = "user_id,full_name,email,role_title,department,phone,bio,avatar_url,avatar_path,status";
const authProfileKeysToClear = {
  role_title: null,
  department: null,
  phone: null,
  bio: null,
  avatar_url: null,
  avatar_path: null,
};

function getObjectMessage(error: unknown) {
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
    ? error.message
    : "";
}

function getObjectCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : "";
}

export function getTeamProfileStorageErrorMessage(error: unknown) {
  const code = getObjectCode(error);
  const message = getObjectMessage(error);

  if (code === "PGRST205" || message.includes("public.team_profiles")) {
    return "جدول team_profiles غير موجود في Supabase. شغّل ملف supabase/migrations/20260428_add_team_profiles.sql من SQL Editor ثم أعد المحاولة.";
  }

  if (message.includes("avatar_path")) {
    return "عمود avatar_path غير موجود في جدول team_profiles. شغّل ملف supabase/migrations/20260428_add_team_profile_avatar_path.sql من SQL Editor ثم أعد المحاولة.";
  }

  return message;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function cleanText(value: unknown, maxLength: number) {
  return asText(value).trim().slice(0, maxLength);
}

function normalizeStatus(value: unknown): "active" | "inactive" {
  return value === "inactive" ? "inactive" : "active";
}

function normalizeRole(value: unknown) {
  const role = cleanText(value, 40);
  return role || "viewer";
}

function getMetadata(user: Pick<User, "user_metadata">) {
  return user.user_metadata ?? {};
}

function profileFromInput(input: TeamProfileInput, fallback: { email?: string | null; fullName?: string }) {
  return {
    fullName: cleanText(input.fullName, 160) || fallback.fullName || cleanText(input.email, 254) || "Team Member",
    email: cleanText(input.email ?? fallback.email, 254),
    teamRole: normalizeRole(input.teamRole),
    roleTitle: cleanText(input.roleTitle, 160),
    department: cleanText(input.department, 160),
    phone: cleanText(input.phone, 80),
    bio: cleanText(input.bio, 4000),
    avatarUrl: cleanText(input.avatarUrl, 700),
    avatarPath: cleanText(input.avatarPath, 400),
    status: normalizeStatus(input.status),
  };
}

function profileFromMetadata(user: Pick<User, "id" | "email" | "user_metadata">): TeamProfile {
  const metadata = user.user_metadata ?? {};
  const fullName = cleanText(metadata.full_name, 160) || cleanText(metadata.name, 160) || cleanText(user.email, 254).split("@")[0] || "Team Member";

  return {
    id: user.id,
    userId: user.id,
    fullName,
    email: user.email ?? "",
    teamRole: normalizeRole(metadata.team_role),
    roleTitle: cleanText(metadata.role_title, 160),
    department: cleanText(metadata.department, 160),
    phone: cleanText(metadata.phone, 80),
    bio: cleanText(metadata.bio, 4000),
    avatarUrl: cleanText(metadata.avatar_url, 700),
    avatarPath: cleanText(metadata.avatar_path, 400),
    status: normalizeStatus(metadata.status),
  };
}

function mapTeamProfile(user: Pick<User, "id" | "email" | "user_metadata">, row?: TeamProfileRow | null): TeamProfile {
  const metadataProfile = profileFromMetadata(user);

  if (!row) {
    return metadataProfile;
  }

  return {
    ...metadataProfile,
    fullName: cleanText(row.full_name, 160) || metadataProfile.fullName,
    email: cleanText(row.email, 254) || metadataProfile.email,
    roleTitle: cleanText(row.role_title, 160) || metadataProfile.roleTitle,
    department: cleanText(row.department, 160) || metadataProfile.department,
    phone: cleanText(row.phone, 80) || metadataProfile.phone,
    bio: cleanText(row.bio, 4000) || metadataProfile.bio,
    avatarUrl: cleanText(row.avatar_url, 700) || metadataProfile.avatarUrl,
    avatarPath: cleanText(row.avatar_path, 400) || metadataProfile.avatarPath,
    status: normalizeStatus(row.status ?? metadataProfile.status),
  };
}

function buildProfileRow(userId: string, input: TeamProfileInput, fallback: { email?: string | null; fullName?: string }) {
  const profile = profileFromInput(input, fallback);

  return {
    user_id: userId,
    full_name: profile.fullName,
    email: profile.email || fallback.email || null,
    role_title: profile.roleTitle,
    department: profile.department,
    phone: profile.phone,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
    avatar_path: profile.avatarPath,
    status: profile.status,
  };
}

export function buildMinimalAuthMetadata(input: TeamProfileInput) {
  const fullName = cleanText(input.fullName, 160) || cleanText(input.email, 254) || "Team Member";

  return {
    full_name: fullName,
    team_role: normalizeRole(input.teamRole),
    status: normalizeStatus(input.status),
    ...authProfileKeysToClear,
  };
}

export async function upsertTeamProfile(
  supabase: SupabaseClient,
  userId: string,
  input: TeamProfileInput,
  fallback: { email?: string | null; fullName?: string } = {}
) {
  const { error } = await supabase.from("team_profiles").upsert(buildProfileRow(userId, input, fallback), {
    onConflict: "user_id",
  });

  if (error) {
    throw new Error(getTeamProfileStorageErrorMessage(error) || "تعذر حفظ بيانات الملف الشخصي في Supabase.");
  }
}

async function fetchProfileRows(supabase: SupabaseClient, userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, TeamProfileRow>();
  }

  const { data, error } = await supabase.from("team_profiles").select(profileSelect).in("user_id", userIds);
  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((row) => [row.user_id, row as TeamProfileRow]).filter(([userId]) => Boolean(userId)) as [string, TeamProfileRow][]);
}

export async function prepareSignedInUserMetadata(user: User) {
  const metadataProfile = profileFromMetadata(user);

  if (!hasSupabaseAdminAccess()) {
    return buildMinimalAuthMetadata(metadataProfile);
  }

  try {
    const admin = createAdminClient();
    const rows = await fetchProfileRows(admin, [user.id]);
    const existingProfile = rows.get(user.id);

    if (!existingProfile) {
      await upsertTeamProfile(admin, user.id, metadataProfile, {
        email: user.email,
        fullName: metadataProfile.fullName,
      });
    }

    return buildMinimalAuthMetadata(mapTeamProfile(user, existingProfile));
  } catch (error) {
    console.warn("[team] Could not sync auth metadata into team_profiles.", error);
    return buildMinimalAuthMetadata(metadataProfile);
  }
}

export async function fetchTeamProfiles(): Promise<TeamProfilesResult> {
  if (!hasSupabaseAdminAccess()) {
    return {
      members: [],
      setupRequired: true,
      setupMessage: "أضف SUPABASE_SERVICE_ROLE_KEY في .env.local حتى يمكن قراءة وإدارة قائمة Auth users.",
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  const users = data.users ?? [];
  let profileRows = new Map<string, TeamProfileRow>();
  let setupMessage: string | undefined;

  try {
    profileRows = await fetchProfileRows(
      supabase,
      users.map((user) => user.id)
    );
  } catch (error) {
    console.warn("[team] Could not read team_profiles.", error);
    setupMessage =
      getTeamProfileStorageErrorMessage(error) ||
      "شغّل migration جدول team_profiles حتى تُقرأ بيانات الملفات الشخصية من الجدول بدل Auth metadata.";
  }

  return {
    members: users.map((user) => mapTeamProfile(user, profileRows.get(user.id))),
    setupRequired: Boolean(setupMessage),
    setupMessage,
  };
}

export async function fetchCurrentUserTeamProfile(user: User, supabase?: SupabaseClient) {
  if (supabase) {
    try {
      const rows = await fetchProfileRows(supabase, [user.id]);
      return mapTeamProfile(user, rows.get(user.id));
    } catch (error) {
      console.warn("[team] Could not read current team profile.", error);
    }
  }

  return profileFromMetadata(user);
}

export function buildCurrentProfileUpdate(user: User, input: TeamProfileInput) {
  const metadata = getMetadata(user);
  const profile = profileFromInput(input, {
    email: user.email,
    fullName: cleanText(metadata.full_name, 160) || cleanText(metadata.name, 160),
  });

  return {
    profile,
    authMetadata: buildMinimalAuthMetadata({
      ...profile,
      teamRole: metadata.team_role,
    }),
  };
}
