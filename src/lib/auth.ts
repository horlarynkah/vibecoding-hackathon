import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/login",
  },
  logger: {
    error(code, metadata) {
      console.error("[nextauth:error]", code, metadata);
    },
    warn(code) {
      console.warn("[nextauth:warn]", code);
    },
    debug(code, metadata) {
      if (process.env.AUTH_DEBUG === "1") {
        console.debug("[nextauth:debug]", code, metadata);
      }
    },
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM ?? "Creator Deal Tracker <no-reply@example.com>",
      // NextAuth requires `server`, but we use Resend API via `sendVerificationRequest`.
      server: "smtp://localhost:25",
      async sendVerificationRequest({ identifier, url }) {
        const appName = "Creator Deal Tracker";
        const from = requireEnv("EMAIL_FROM");
        const resend = new Resend(requireEnv("RESEND_API_KEY"));

        if (AUTH_DEBUG) {
          try {
            const u = new URL(url);
            const identifierDomain =
              typeof identifier === "string" && identifier.includes("@")
                ? identifier.split("@").pop() ?? null
                : null;

            const data = {
              urlOrigin: u.origin,
              urlPathname: u.pathname,
              urlHasTokenParam: u.searchParams.has("token"),
              urlHasEmailParam: u.searchParams.has("email"),
              identifierDomain,
              nextAuthUrlPresent: Boolean(process.env.NEXTAUTH_URL),
              publicUrlPresent: Boolean(process.env.NEXT_PUBLIC_URL),
            };

            // #region agent log
            const payload = {sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_callback_url_mismatch',location:'src/lib/auth.ts:sendVerificationRequest',message:'Sending email verification link (redacted)',data,timestamp:Date.now()};
            fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify(payload)}).catch(()=>{});
            console.log("[auth-debug]", JSON.stringify(payload));
            // #endregion agent log
          } catch {
            // no-op
          }
        }

        await resend.emails.send({
          from,
          to: identifier,
          subject: `Sign in to ${appName}`,
          html: `
            <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
              <h2 style="margin: 0 0 12px;">Sign in to ${appName}</h2>
              <p style="margin: 0 0 16px; color: #444;">Click the button below to finish signing in. This link is single-use.</p>
              <p style="margin: 0 0 16px;">
                <a href="${url}" style="display:inline-block;background:#111827;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;">
                  Sign in
                </a>
              </p>
              <p style="margin: 0; color: #666; font-size: 12px;">If you didn’t request this email, you can safely ignore it.</p>
            </div>
          `,
        });

        if (AUTH_DEBUG) {
          // #region agent log
          const payload = {sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_email_send_ok',location:'src/lib/auth.ts:sendVerificationRequest',message:'Resend email sent (no recipient logged)',data:{ok:true},timestamp:Date.now()};
          fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify(payload)}).catch(()=>{});
          console.log("[auth-debug]", JSON.stringify(payload));
          // #endregion agent log
        }
      },
    }),
  ],
  session: {
    // Required for `withAuth` middleware to have a `token`.
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, `user` is present; afterwards it's undefined.
      if (user) {
        const subscriptionStatus = (
          user as unknown as { subscriptionStatus?: string }
        ).subscriptionStatus;
        (token as unknown as { subscriptionStatus?: string }).subscriptionStatus =
          subscriptionStatus ?? "FREE";
      }

      if (AUTH_DEBUG) {
        const data = {
          tokenSubPresent: typeof token.sub === "string",
          tokenHasSubscriptionStatus: Object.prototype.hasOwnProperty.call(
            token,
            "subscriptionStatus"
          ),
          userPresent: Boolean(user),
        };
        // #region agent log
        const payload = {sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_jwt_token_present',location:'src/lib/auth.ts:callbacks.jwt',message:'NextAuth jwt() callback executed',data,timestamp:Date.now()};
        fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify(payload)}).catch(()=>{});
        console.log("[auth-debug]", JSON.stringify(payload));
        // #endregion agent log
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id =
          typeof token?.sub === "string"
            ? token.sub
            : typeof user?.id === "string"
              ? user.id
              : "";
        const subscriptionStatus =
          (token as unknown as { subscriptionStatus?: string })?.subscriptionStatus ??
          (user as unknown as { subscriptionStatus?: string } | undefined)
            ?.subscriptionStatus ??
          "FREE";
        session.user.subscriptionStatus = subscriptionStatus;
      }

      if (AUTH_DEBUG) {
        const data = {
          sessionUserPresent: Boolean(session.user),
          userIdPresent: Boolean(session.user?.id),
          subscriptionStatus: session.user?.subscriptionStatus ?? null,
        };
        // #region agent log
        const payload = {sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_session_callback',location:'src/lib/auth.ts:callbacks.session',message:'NextAuth session() callback executed',data,timestamp:Date.now()};
        fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify(payload)}).catch(()=>{});
        console.log("[auth-debug]", JSON.stringify(payload));
        // #endregion agent log
      }

      return session;
    },
  },
};

