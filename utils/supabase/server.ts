import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      encode: "tokens-only",
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          if (cookiesToSet.length > 0) {
            const totalValueBytes = cookiesToSet.reduce((sum, cookie) => sum + cookie.value.length, 0);
            console.info("[supabase][server] setting auth cookies", {
              count: cookiesToSet.length,
              names: cookiesToSet.map((cookie) => cookie.name),
              totalValueBytes,
            });
          }

          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // This may run inside a Server Component where response mutation is not available.
        }
      },
    },
  });
};
