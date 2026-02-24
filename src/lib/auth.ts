import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

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
      },
    }),
  ],
  session: {
    // Required for `withAuth` middleware to have a `token`.
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const userId =
        typeof user?.id === "string"
          ? user.id
          : typeof token?.sub === "string"
            ? token.sub
            : null;

      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionStatus: true },
        });

        (token as unknown as { subscriptionStatus?: string }).subscriptionStatus =
          dbUser?.subscriptionStatus === "PRO" ? "PRO" : "FREE";
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

      return session;
    },
  },
};

