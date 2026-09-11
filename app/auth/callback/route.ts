import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CallbackError =
  | "missing_code"
  | "invalid_or_expired_code"
  | "callback_failed";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    const error = requestUrl.searchParams.has("error")
      ? "invalid_or_expired_code"
      : "missing_code";

    return redirectToLoginWithError(requestUrl, error);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return redirectToLoginWithError(requestUrl, "invalid_or_expired_code");
    }
  } catch {
    return redirectToLoginWithError(requestUrl, "callback_failed");
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}

function redirectToLoginWithError(requestUrl: URL, error: CallbackError) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", error);

  return NextResponse.redirect(loginUrl);
}
