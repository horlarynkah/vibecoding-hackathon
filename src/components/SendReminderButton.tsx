"use client";

import { useState } from "react";

export function SendReminderButton({
  dealId,
  disabled,
}: {
  dealId: string;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  return (
    <button
      disabled={disabled || loading}
      onClick={async () => {
        setLoading(true);
        setStatus("idle");
        try {
          const res = await fetch("/api/reminders/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dealId }),
          });
          if (!res.ok) {
            setStatus("error");
            return;
          }
          setStatus("sent");
          setTimeout(() => setStatus("idle"), 2500);
        } catch {
          setStatus("error");
        } finally {
          setLoading(false);
        }
      }}
      className={[
        "inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-medium ring-1 transition-colors",
        disabled
          ? "cursor-not-allowed bg-zinc-100 text-zinc-400 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-600 dark:ring-zinc-800"
          : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-900",
      ].join(" ")}
      type="button"
    >
      {loading
        ? "Sending…"
        : status === "sent"
          ? "Sent"
          : status === "error"
            ? "Error"
            : "Send reminder"}
    </button>
  );
}

