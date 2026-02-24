"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type DealFormValues = {
  brand: string;
  campaign: string;
  platform: string;
  value: string;
  paymentStatus: string;
  stage: string;
  dueDate: string;
  notes: string;
};

function formatDateInput(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function DealForm({
  mode,
  dealId,
  initial,
}: {
  mode: "create" | "edit";
  dealId?: string;
  initial?: Partial<{
    brand: string;
    campaign: string;
    platform: string;
    value: number;
    paymentStatus: string;
    stage: string;
    dueDate: Date;
    notes: string | null;
  }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults: DealFormValues = useMemo(
    () => ({
      brand: initial?.brand ?? "",
      campaign: initial?.campaign ?? "",
      platform: initial?.platform ?? "",
      value:
        typeof initial?.value === "number" && Number.isFinite(initial.value)
          ? String(initial.value)
          : "",
      paymentStatus: initial?.paymentStatus ?? "PENDING",
      stage: initial?.stage ?? "Prospecting",
      dueDate: initial?.dueDate ? formatDateInput(initial.dueDate) : "",
      notes: initial?.notes ?? "",
    }),
    [initial]
  );

  const [values, setValues] = useState<DealFormValues>(defaults);

  function update<K extends keyof DealFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const valueNumber = Number(values.value);
      const dueDateIso = new Date(`${values.dueDate}T00:00:00.000Z`).toISOString();

      const payload = {
        brand: values.brand,
        campaign: values.campaign,
        platform: values.platform,
        value: valueNumber,
        paymentStatus: values.paymentStatus,
        stage: values.stage,
        dueDate: dueDateIso,
        notes: values.notes ? values.notes : null,
      };

      const res = await fetch(
        mode === "create" ? "/api/deals" : `/api/deals/${dealId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error || "Something went wrong.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!dealId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error || "Could not delete.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not delete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === "create" ? "New deal" : "Edit deal"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Keep deal details consistent so metrics are accurate.
          </p>
        </div>
        <div className="flex gap-2">
          {mode === "edit" ? (
            <button
              onClick={() => void remove()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/20"
              type="button"
            >
              Delete
            </button>
          ) : null}
          <button
            onClick={() => void save()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            type="button"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Brand</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10 dark:placeholder:text-zinc-500"
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Campaign</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10 dark:placeholder:text-zinc-500"
            value={values.campaign}
            onChange={(e) => update("campaign", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Platform</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10 dark:placeholder:text-zinc-500"
            placeholder="Instagram, YouTube, TikTok…"
            value={values.platform}
            onChange={(e) => update("platform", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Value</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10 dark:placeholder:text-zinc-500"
            inputMode="decimal"
            placeholder="2500"
            value={values.value}
            onChange={(e) => update("value", e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Payment status</span>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10"
            value={values.paymentStatus}
            onChange={(e) => update("paymentStatus", e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Stage</span>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10"
            value={values.stage}
            onChange={(e) => update("stage", e.target.value)}
          >
            <option value="Prospecting">Prospecting</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Contract signed">Contract signed</option>
            <option value="Content delivered">Content delivered</option>
            <option value="Invoiced">Invoiced</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Due date</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10"
            type="date"
            value={values.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Notes (optional)</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-50/10 dark:placeholder:text-zinc-500"
            value={values.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

