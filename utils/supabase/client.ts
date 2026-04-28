import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/utils/supabase/config";

export const createClient = () => {
  const { supabaseUrl, supabaseKey } = getSupabasePublicConfig();

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      encode: "tokens-only",
      getAll() {
        if (typeof document === "undefined") {
          return [];
        }

        return document.cookie
          .split(";")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => {
            const separatorIndex = part.indexOf("=");
            const name = separatorIndex === -1 ? part : part.slice(0, separatorIndex);
            const value = separatorIndex === -1 ? "" : part.slice(separatorIndex + 1);

            return { name, value };
          });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const segments = [`${name}=${value}`];

          if (options.path) segments.push(`Path=${options.path}`);
          if (options.domain) segments.push(`Domain=${options.domain}`);
          if (typeof options.maxAge === "number") segments.push(`Max-Age=${options.maxAge}`);
          if (options.expires) segments.push(`Expires=${options.expires.toUTCString()}`);
          if (options.sameSite) {
            const sameSite =
              typeof options.sameSite === "string"
                ? options.sameSite
                : options.sameSite === true
                  ? "Strict"
                  : "Lax";
            segments.push(`SameSite=${sameSite}`);
          }
          if (options.httpOnly) segments.push("HttpOnly");
          if (options.secure) segments.push("Secure");

          document.cookie = segments.join("; ");
        });
      },
    },
  });
};
