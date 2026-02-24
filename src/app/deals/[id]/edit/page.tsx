import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { DealForm } from "@/components/DealForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          ← Back to dashboard
        </Link>
      </header>
      <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-4">
        <DealForm
          mode="edit"
          dealId={deal.id}
          initial={{
            brand: deal.brand,
            campaign: deal.campaign,
            platform: deal.platform,
            value: deal.value,
            paymentStatus: deal.paymentStatus,
            stage: deal.stage,
            dueDate: deal.dueDate,
            notes: deal.notes,
          }}
        />
      </main>
    </div>
  );
}

