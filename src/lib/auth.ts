import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  },
  providers: [
    EmailProvider({
      from: requireEnv("EMAIL_FROM"),
      // NextAuth requires `server`, but we use Resend API via `sendVerificationRequest`.
      server: {} as any,
      async sendVerificationRequest({ identifier, url }) {
        const appName = "Creator Deal Tracker";
        const from = requireEnv("EMAIL_FROM");

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
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error - added via module augmentation
        session.user.subscriptionStatus = user.subscriptionStatus;
      }
      return session;
    },
  },
};

