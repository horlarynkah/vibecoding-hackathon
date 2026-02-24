import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProUser } from "@/lib/subscription";

function money(amount: number) {
  return Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
    amount
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pro = await isProUser(session.user.id);
  if (!pro) {
    return new Response(JSON.stringify({ error: "PRO required to generate invoices." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { dealId } = await params;

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
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!deal) {
    return new Response(JSON.stringify({ error: "Deal not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const invoiceDate = new Date();
  const invoiceDateStr = invoiceDate.toLocaleDateString();
  const dueDateStr = deal.dueDate.toLocaleDateString();
  const amountStr = money(deal.value);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 54;
  let y = 740;

  page.drawText("INVOICE", {
    x: marginX,
    y,
    size: 28,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });

  y -= 36;
  page.drawText(`Invoice date: ${invoiceDateStr}`, {
    x: marginX,
    y,
    size: 12,
    font,
    color: rgb(0.35, 0.35, 0.38),
  });

  y -= 18;
  page.drawText(`Creator: ${user.email}`, {
    x: marginX,
    y,
    size: 12,
    font,
    color: rgb(0.35, 0.35, 0.38),
  });

  y -= 38;
  page.drawText("Billed to", {
    x: marginX,
    y,
    size: 13,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });
  y -= 18;
  page.drawText(deal.brand, {
    x: marginX,
    y,
    size: 12,
    font,
    color: rgb(0.07, 0.09, 0.15),
  });

  y -= 38;
  page.drawText("Campaign", {
    x: marginX,
    y,
    size: 13,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });
  y -= 18;
  page.drawText(deal.campaign, {
    x: marginX,
    y,
    size: 12,
    font,
    color: rgb(0.07, 0.09, 0.15),
  });

  y -= 38;
  page.drawText("Amount due", {
    x: marginX,
    y,
    size: 13,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });
  y -= 18;
  page.drawText(amountStr, {
    x: marginX,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });

  y -= 30;
  page.drawText(`Due date: ${dueDateStr}`, {
    x: marginX,
    y,
    size: 12,
    font,
    color: rgb(0.35, 0.35, 0.38),
  });

  const pdfBytes = await pdfDoc.save();
  const filename = `invoice-${deal.id}.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

