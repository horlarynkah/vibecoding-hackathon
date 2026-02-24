import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ deal });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!body) return badRequest("Invalid JSON body");

  const data: Record<string, unknown> = {};

  if (typeof body.brand === "string") data.brand = body.brand.trim();
  if (typeof body.campaign === "string") data.campaign = body.campaign.trim();
  if (typeof body.platform === "string") data.platform = body.platform.trim();
  if (typeof body.paymentStatus === "string")
    data.paymentStatus = body.paymentStatus.trim();
  if (typeof body.stage === "string") data.stage = body.stage.trim();
  if (typeof body.notes === "string") data.notes = body.notes.trim();
  if (body.notes === null) data.notes = null;

  if (typeof body.value === "number") data.value = body.value;
  if (typeof body.value === "string") data.value = Number(body.value);

  if (typeof body.dueDate === "string") data.dueDate = new Date(body.dueDate);

  if ("value" in data) {
    const v = data.value as number;
    if (!Number.isFinite(v) || v < 0) return badRequest("value is invalid");
  }
  if ("dueDate" in data) {
    const d = data.dueDate as Date;
    if (Number.isNaN(d.getTime())) return badRequest("dueDate is invalid");
  }

  const deal = await prisma.deal.updateMany({
    where: { id, userId: session.user.id },
    data,
  });

  if (deal.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ deal: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const deleted = await prisma.deal.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

