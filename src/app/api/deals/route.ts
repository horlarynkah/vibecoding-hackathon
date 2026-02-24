import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/subscription";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ deals });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptionStatus = await getSubscriptionStatus(session.user.id);
  if (subscriptionStatus === "FREE") {
    const existingCount = await prisma.deal.count({
      where: { userId: session.user.id },
    });
    if (existingCount >= 3) {
      return NextResponse.json(
        {
          error:
            "FREE plan allows up to 3 deals. Upgrade to PRO for unlimited deals.",
        },
        { status: 403 }
      );
    }
  }

  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!body) return badRequest("Invalid JSON body");

  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const campaign = typeof body.campaign === "string" ? body.campaign.trim() : "";
  const platform = typeof body.platform === "string" ? body.platform.trim() : "";
  const paymentStatus =
    typeof body.paymentStatus === "string" ? body.paymentStatus.trim() : "";
  const stage = typeof body.stage === "string" ? body.stage.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;

  const value =
    typeof body.value === "number"
      ? body.value
      : typeof body.value === "string"
        ? Number(body.value)
        : NaN;

  const dueDateRaw = body.dueDate;
  const dueDate =
    typeof dueDateRaw === "string" ? new Date(dueDateRaw) : new Date("");

  if (!brand) return badRequest("brand is required");
  if (!campaign) return badRequest("campaign is required");
  if (!platform) return badRequest("platform is required");
  if (!Number.isFinite(value) || value < 0) return badRequest("value is invalid");
  if (!paymentStatus) return badRequest("paymentStatus is required");
  if (!stage) return badRequest("stage is required");
  if (Number.isNaN(dueDate.getTime())) return badRequest("dueDate is invalid");

  const deal = await prisma.deal.create({
    data: {
      userId: session.user.id,
      brand,
      campaign,
      platform,
      value,
      paymentStatus,
      stage,
      dueDate,
      notes,
    },
  });

  return NextResponse.json({ deal }, { status: 201 });
}

