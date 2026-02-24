import Link from "next/link";
import { getServerSession } from "next-auth";

import { UpgradeButton } from "@/components/UpgradeButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/subscription";

const FREE_DEAL_LIMIT = 3;

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const subscriptionStatus = userId
    ? await getSubscriptionStatus(userId)
    : (session?.user?.subscriptionStatus ?? "FREE");

  const existingDealCount =
    userId && subscriptionStatus === "FREE"
      ? await prisma.deal.count({ where: { userId } })
      : null;
  const freeDealsLeft =
    existingDealCount === null
      ? null
      : Math.max(0, FREE_DEAL_LIMIT - existingDealCount);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Creator Deal Tracker
        </Link>
        <nav className="flex items-center gap-2">
          {session?.user?.id ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-10">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Start on FREE and upgrade to PRO when you need reminders and invoices.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-semibold">FREE</p>
            <p className="mt-2 text-3xl font-semibold">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Up to 3 deals</li>
              <li>Deal tracking + payment status</li>
              <li>No reminders</li>
              <li>No invoices</li>
            </ul>
            {userId ? (
              <div className="mt-6 space-y-2">
                {subscriptionStatus === "PRO" ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    You’re on PRO — unlimited deals.
                  </p>
                ) : (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {freeDealsLeft === null
                      ? `Up to ${FREE_DEAL_LIMIT} free deals.`
                      : `${freeDealsLeft} of ${FREE_DEAL_LIMIT} free deals left.`}
                  </p>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/register"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create account
              </Link>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-semibold">PRO</p>
            <p className="mt-2 text-3xl font-semibold">
              $9<span className="text-base font-medium text-zinc-600 dark:text-zinc-400">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Unlimited deals</li>
              <li>Email reminders</li>
              <li>PDF invoices</li>
            </ul>
            {session?.user?.id ? (
              subscriptionStatus === "PRO" ? (
                <p className="mt-6 text-xs text-zinc-500">
                  You’re already on PRO.
                </p>
              ) : (
                <UpgradeButton />
              )
            ) : (
              <p className="mt-6 text-xs text-zinc-500">
                Upgrade via Stripe after you sign in.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

