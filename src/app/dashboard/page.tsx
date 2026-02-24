import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const subscriptionStatus =
    (session.user as any).subscriptionStatus ?? "FREE";

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
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            You’re signed in as <span className="font-medium">{session.user.email}</span>.
          </p>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Deal CRUD, metrics, and PRO features will appear here as we progress
            through the next phases.
          </p>
        </div>
      </main>
    </div>
  );
}

