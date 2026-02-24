import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AuthEmailForm } from "@/components/AuthEmailForm";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Creator Deal Tracker
        </Link>
        <Link
          href="/pricing"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Pricing
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg px-6 pb-16 pt-10">
        <AuthEmailForm
          title="Sign in"
          subtitle="Use your email to get a secure sign-in link."
          actionLabel="Email me a link"
        />
        <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
          New here?{" "}
          <Link
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
            href="/register"
          >
            Create an account
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

