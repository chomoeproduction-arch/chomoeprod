const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabasePublicConfig() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabasePublicConfig() {
  if (!supabaseUrl || !supabaseKey) {
    const missing = [
      !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
      !supabaseKey ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
    ].filter(Boolean);

    throw new Error(`Missing Supabase public configuration: ${missing.join(", ")}`);
  }

  return { supabaseUrl, supabaseKey };
}
