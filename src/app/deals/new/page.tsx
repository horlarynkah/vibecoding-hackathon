import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DealForm } from "@/components/DealForm";

export default async function NewDealPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          ← Back to dashboard
        </Link>
      </header>
      <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-4">
        <DealForm mode="create" />
      </main>
    </div>
  );
}

