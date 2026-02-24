import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Deal Tracker",
  description:
    "Track brand deals, monitor payments, and generate invoices (PRO).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
