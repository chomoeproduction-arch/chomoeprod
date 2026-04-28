import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { prepareSignedInUserMetadata } from "@/lib/team";
import { createClient as createServerClient } from "@/utils/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const authClient = createSupabaseClient(supabaseUrl!, supabaseKey!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message =
      error.message === "Invalid login credentials"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        : error.message === "Email not confirmed"
          ? "يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول."
          : `تعذر تسجيل الدخول: ${error.message}`;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 401 }
    );
  }

  if (data.user) {
    const authMetadata = await prepareSignedInUserMetadata(data.user);
    const { error: metadataError } = await authClient.auth.updateUser({ data: authMetadata });

    if (metadataError) {
      return NextResponse.json(
        {
          ok: false,
          error: `تم قبول بيانات الدخول لكن تعذر تجهيز الجلسة: ${metadataError.message}`,
        },
        { status: 500 }
      );
    }
  }

  const { data: cleanData, error: cleanError } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (cleanError || !cleanData.session) {
    return NextResponse.json(
      {
        ok: false,
        error: cleanError?.message ? `تعذر تجهيز جلسة صغيرة: ${cleanError.message}` : "تعذر تجهيز جلسة صغيرة.",
      },
      { status: 500 }
    );
  }

  const supabase = await createServerClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: cleanData.session.access_token,
    refresh_token: cleanData.session.refresh_token,
  });

  if (sessionError) {
    return NextResponse.json(
      {
        ok: false,
        error: `تعذر حفظ جلسة الدخول: ${sessionError.message}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
