import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Creator Deal Tracker
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              Track deals. Get paid. Stay on top of deadlines.
            </p>
            <h1 className="mt-4 text-pretty text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A simple CRM for creator brand deals.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Log brand deals, monitor payment status, and keep campaigns moving.
              Upgrade to PRO to send payment reminders and generate invoices.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create account
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                View pricing
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  FREE
                </p>
                <p className="mt-1">Up to 3 active deals.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  PRO
                </p>
                <p className="mt-1">Unlimited + reminders + invoices.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-black">
              <p className="text-xs font-medium text-zinc-500">
                Example deal
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-zinc-500">Brand</p>
                  <p className="mt-1 text-sm font-medium">Aurora Skincare</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Value</p>
                  <p className="mt-1 text-sm font-medium">$2,500</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Payment</p>
                  <p className="mt-1 text-sm font-medium">Pending</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Due date</p>
                  <p className="mt-1 text-sm font-medium">Mar 15</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800">
                  Stage: Contract signed
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800">
                  Platform: Instagram
                </span>
              </div>
            </div>

            <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                MVP features
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Deal CRUD with user isolation</li>
                <li>FREE vs PRO enforcement</li>
                <li>Stripe subscription upgrade</li>
                <li>PRO-only email reminders + PDF invoices</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
