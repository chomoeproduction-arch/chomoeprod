import type { User } from "@supabase/supabase-js";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getActivityAuthor(user: User) {
  const metadata = user.user_metadata ?? {};
  const email = user.email ?? "";
  const fallbackName = email.split("@")[0] || "Team Member";

  return {
    userId: user.id,
    name: asText(metadata.full_name) || asText(metadata.name) || fallbackName,
    email,
  };
}
