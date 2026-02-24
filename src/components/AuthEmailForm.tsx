"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthEmailForm({
  title,
  subtitle,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const AUTH_DEBUG =
    typeof window !== "undefined" &&
    new URL(window.location.href).searchParams.get("authDebug") === "1";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      </div>

      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSent(false);
          setLoading(true);
          try {
            const result = await signIn("email", {
              email,
              callbackUrl: "/dashboard",
              redirect: false,
            });

            if (AUTH_DEBUG) {
              const emailDomain = email.includes("@") ? email.split("@").pop() : null;
              const data = {
                ok: result?.ok ?? null,
                status: result?.status ?? null,
                error: result?.error ?? null,
                urlPath: result?.url ? new URL(result.url, window.location.origin).pathname : null,
                emailDomain,
              };
              // #region agent log
              fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify({sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_client_signin_request',location:'src/components/AuthEmailForm.tsx:onSubmit',message:'Client signIn("email") result',data,timestamp:Date.now()})}).catch(()=>{});
              // #endregion agent log
            }

            if (result?.error) {
              setError("Could not send sign-in link.");
              return;
            }
            setSent(true);
            if (result?.url) router.push(result.url);
          } catch {
            setError("Could not send sign-in link.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10 dark:placeholder:text-zinc-500"
            placeholder="you@domain.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : sent ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Check your email for a secure sign-in link.
          </p>
        ) : null}

        <button
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          type="submit"
        >
          {loading ? "Sending link..." : actionLabel}
        </button>
      </form>

      <p className="mt-4 text-xs text-zinc-500">
        We’ll email you a sign-in link. No password required.
      </p>
    </div>
  );
}

