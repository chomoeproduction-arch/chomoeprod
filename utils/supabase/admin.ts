import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, hasSupabasePublicConfig } from "@/utils/supabase/config";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseAdminAccess() {
  return hasSupabasePublicConfig() && Boolean(serviceRoleKey);
}

export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_ADMIN_NOT_CONFIGURED");
  }
  const { supabaseUrl } = getSupabasePublicConfig();

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
