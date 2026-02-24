import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
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

