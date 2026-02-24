import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

function logAuthRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const header = (name: string) => req.headers.get(name);
    const cookieHeader = header("cookie");

    const rawNextAuthUrl = process.env.NEXTAUTH_URL ?? null;
    const nextAuthUrl = rawNextAuthUrl?.trim() ?? null;
    const rawPublicUrl = process.env.NEXT_PUBLIC_URL ?? null;
    const publicUrl = rawPublicUrl?.trim() ?? null;

    const payload = {
      sessionId: "37512e",
      runId: "prod-pre-fix",
      hypothesisId: "P_prod_env_host_cookie_mismatch",
      location: "src/app/api/auth/[...nextauth]/route.ts:15",
      message: "NextAuth route request",
      data: {
        method: req.method,
        pathname: url.pathname,
        hasErrorParam: url.searchParams.has("error"),
        errorParam: url.searchParams.get("error"),
        hasCallbackUrlParam: url.searchParams.has("callbackUrl"),
        callbackUrlOrigin: (() => {
          const c = url.searchParams.get("callbackUrl");
          if (!c) return null;
          try {
            return new URL(c).origin;
          } catch {
            return null;
          }
        })(),
        host: header("host"),
        xfHost: header("x-forwarded-host"),
        xfProto: header("x-forwarded-proto"),
        origin: header("origin"),
        referer: header("referer"),
        cookieHeaderPresent: Boolean(cookieHeader),
        cookieHeaderLength: cookieHeader?.length ?? 0,
        nextAuthUrl,
        nextAuthUrlHasWhitespace:
          rawNextAuthUrl !== null && rawNextAuthUrl !== nextAuthUrl,
        publicUrl,
        publicUrlHasWhitespace: rawPublicUrl !== null && rawPublicUrl !== publicUrl,
      },
      timestamp: Date.now(),
    };

    // Vercel captures stdout/stderr
    console.log("[auth-debug]", JSON.stringify(payload));

    // #region agent log
    fetch("http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "37512e" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    // #endregion agent log
  } catch {
    // no-op
  }
}

export async function GET(req: Request) {
  logAuthRequest(req);
  return handler(req);
}

export async function POST(req: Request) {
  logAuthRequest(req);
  return handler(req);
}

