"use client";

export function DownloadInvoiceButton({
  dealId,
  disabled,
}: {
  dealId: string;
  disabled: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        window.open(`/api/invoices/${dealId}`, "_blank", "noopener,noreferrer");
      }}
      className={[
        "inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-medium ring-1 transition-colors",
        disabled
          ? "cursor-not-allowed bg-zinc-100 text-zinc-400 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-600 dark:ring-zinc-800"
          : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-900",
      ].join(" ")}
      type="button"
    >
      Download invoice
    </button>
  );
}

