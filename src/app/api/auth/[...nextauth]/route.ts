import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";

type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function logAuthRequest(req: Request, ctx?: RouteContext) {
  if (!AUTH_DEBUG) return;
  try {
    const url = new URL(req.url);
    const header = (name: string) => req.headers.get(name);
    const cookieHeader = header("cookie");

    const nextauthParam = ctx ? (await ctx.params).nextauth : null;

    const rawNextAuthUrl = process.env.NEXTAUTH_URL ?? null;
    const nextAuthUrl = rawNextAuthUrl?.trim() ?? null;
    const rawPublicUrl = process.env.NEXT_PUBLIC_URL ?? null;
    const publicUrl = rawPublicUrl?.trim() ?? null;

    const data = {
      method: req.method,
      pathname: url.pathname,
      nextauthParam,
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
      nextAuthSecretPresent: Boolean(process.env.NEXTAUTH_SECRET),
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length ?? 0,
    };

    // #region agent log
    const payload = {sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_env_host_cookie_mismatch',location:'src/app/api/auth/[...nextauth]/route.ts:logAuthRequest',message:'NextAuth route request',data,timestamp:Date.now()};
    fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify(payload)}).catch(()=>{});
    console.log("[auth-debug]", JSON.stringify(payload));
    // #endregion agent log
  } catch {
    // no-op
  }
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  void logAuthRequest(req, ctx);
  try {
    const params = await ctx.params;
    // Forward resolved params so NextAuth can reconstruct `req.query.nextauth`.
    return await (handler as unknown as (r: NextRequest, c: { params: { nextauth: string[] } }) => Promise<Response>)(
      req,
      { params }
    );
  } catch (err) {
    console.error("[auth-error] GET /api/auth/[...nextauth]", err);
    throw err;
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  void logAuthRequest(req, ctx);
  try {
    const params = await ctx.params;
    return await (handler as unknown as (r: NextRequest, c: { params: { nextauth: string[] } }) => Promise<Response>)(
      req,
      { params }
    );
  } catch (err) {
    console.error("[auth-error] POST /api/auth/[...nextauth]", err);
    throw err;
  }
}

