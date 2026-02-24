import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { isProUser } from "@/lib/subscription";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pro = await isProUser(session.user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "PRO required to send reminders." },
      { status: 403 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { dealId?: unknown }
    | null;
  const dealId = typeof body?.dealId === "string" ? body.dealId : null;
  if (!dealId) {
    return NextResponse.json({ error: "dealId is required" }, { status: 400 });
  }

  const [user, deal] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    }),
    prisma.deal.findFirst({
      where: { id: dealId, userId: session.user.id },
    }),
  ]);

  if (!user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const resend = getResend();
  const from = requireEnv("EMAIL_FROM");

  const due = deal.dueDate.toLocaleDateString();
  const value = Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(deal.value);

  await resend.emails.send({
    from,
    to: user.email,
    subject: `Payment reminder: ${deal.brand} • ${deal.campaign}`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
        <h2 style="margin:0 0 10px;">Payment reminder</h2>
        <p style="margin:0 0 16px;color:#444;">
          Here’s a quick reminder to follow up on an outstanding deal payment.
        </p>

        <table style="border-collapse:collapse;width:100%;max-width:520px;">
          <tr><td style="padding:6px 0;color:#666;width:140px;">Brand</td><td style="padding:6px 0;"><strong>${deal.brand}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Campaign</td><td style="padding:6px 0;"><strong>${deal.campaign}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Amount</td><td style="padding:6px 0;"><strong>${value}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Due date</td><td style="padding:6px 0;"><strong>${due}</strong></td></tr>
        </table>

        <p style="margin:16px 0 0;color:#444;">
          Suggested follow-up message:
        </p>
        <pre style="margin:10px 0 0;padding:12px;border-radius:10px;background:#f4f4f5;color:#111827;white-space:pre-wrap;">
Hi ${deal.brand} team,\n\nJust checking in on the ${deal.campaign} payment (${value}) due on ${due}. Could you share an ETA for payment processing?\n\nThanks!
        </pre>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}

