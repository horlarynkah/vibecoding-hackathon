import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Creator Deal Tracker
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
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
            <Link
              href="/register"
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create account
            </Link>
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
            <p className="mt-6 text-xs text-zinc-500">
              Upgrade via Stripe after you sign in.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

