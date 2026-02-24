"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-6">
      {error ? (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/stripe/checkout", { method: "POST" });
            const data = (await res.json().catch(() => null)) as
              | { url?: string; error?: string }
              | null;

            if (!res.ok) {
              setError(data?.error || "Could not start checkout.");
              return;
            }
            if (!data?.url) {
              setError("Missing checkout URL.");
              return;
            }
            window.location.href = data.url;
          } catch (e: unknown) {
            setError("Could not start checkout.");
          } finally {
            setLoading(false);
          }
        }}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        type="button"
      >
        {loading ? "Redirecting…" : "Upgrade to PRO"}
      </button>
    </div>
  );
}

