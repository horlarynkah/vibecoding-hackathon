import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DownloadInvoiceButton } from "@/components/DownloadInvoiceButton";
import { SendReminderButton } from "@/components/SendReminderButton";
import { SignOutButton } from "@/components/SignOutButton";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );

  const [deals, paidAgg, pendingAgg, paidThisMonthAgg, activeCount, userSub] =
    await prisma.$transaction([
      prisma.deal.findMany({
        where: { userId: session.user.id },
        orderBy: { dueDate: "asc" },
      }),
      prisma.deal.aggregate({
        where: { userId: session.user.id, paymentStatus: "PAID" },
        _sum: { value: true },
        _count: { _all: true },
      }),
      prisma.deal.aggregate({
        where: {
          userId: session.user.id,
          paymentStatus: { in: ["PENDING", "OVERDUE"] },
        },
        _sum: { value: true },
        _count: { _all: true },
      }),
      prisma.deal.aggregate({
        where: {
          userId: session.user.id,
          paymentStatus: "PAID",
          createdAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { value: true },
        _count: { _all: true },
      }),
      prisma.deal.count({
        where: { userId: session.user.id, paymentStatus: { not: "PAID" } },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true },
      }),
    ]);

  const subscriptionStatus = userSub?.subscriptionStatus ?? "FREE";

  const paidTotal = paidAgg._sum.value ?? 0;
  const pendingTotal = pendingAgg._sum.value ?? 0;
  const paidThisMonth = paidThisMonthAgg._sum.value ?? 0;

  const canCreateDeal = subscriptionStatus === "PRO" || deals.length < 3;
  const money = (amount: number) =>
    Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
      amount
    );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Creator Deal Tracker
          </Link>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800">
            {subscriptionStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Pricing
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500">Total earnings</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {money(paidTotal)}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {paidAgg._count._all} paid deal{paidAgg._count._all === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500">Pending payments</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {money(pendingTotal)}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {pendingAgg._count._all} pending deal
              {pendingAgg._count._all === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500">Paid this month</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {money(paidThisMonth)}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {paidThisMonthAgg._count._all} paid deal
              {paidThisMonthAgg._count._all === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500">Active deals</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Not yet paid
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Deals</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              You’re signed in as{" "}
              <span className="font-medium">{session.user.email}</span>.
            </p>
          </div>
          {canCreateDeal ? (
            <Link
              href="/deals/new"
              className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              New deal
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Limit reached • Upgrade
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {deals.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No deals yet. Create your first one.
              </p>
            </div>
          ) : null}

          {deals.map((deal: any) => (
            <div
              key={deal.id}
              className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    {deal.brand}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {deal.campaign} • {deal.platform}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-black dark:text-zinc-300 dark:ring-zinc-800">
                  {deal.paymentStatus}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Value</p>
                  <p className="mt-1 font-medium">{money(deal.value)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Due</p>
                  <p className="mt-1 font-medium">
                    {deal.dueDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500">Stage</p>
                  <p className="mt-1 font-medium">{deal.stage}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <SendReminderButton
                    dealId={deal.id}
                    disabled={subscriptionStatus !== "PRO"}
                  />
                  <DownloadInvoiceButton
                    dealId={deal.id}
                    disabled={subscriptionStatus !== "PRO"}
                  />
                  {subscriptionStatus !== "PRO" ? (
                    <span className="text-xs text-zinc-500">
                      PRO feature
                    </span>
                  ) : null}
                </div>
                <Link
                  href={`/deals/${deal.id}/edit`}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

