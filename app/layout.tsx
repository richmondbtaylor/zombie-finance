import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Sponsors from "@/components/Sponsors";

export const metadata: Metadata = {
  title: "Zombie Finance",
  description: "A half-built invoicing and money app. Bring it back to life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="zombie-bar">
          🧟 Zombie build: it half works. Read ZOMBIE.md for what to fix.
        </div>
        <nav className="nav">
          <Link href="/" className="brand">Zombie Finance</Link>
          <Link href="/">Dashboard</Link>
          <Link href="/invoices">Invoices</Link>
          <Link href="/invoices/new">New invoice</Link>
          <Link href="/expenses">Expenses</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/budgets">Budgets</Link>
          <Link href="/reports">Profit and loss</Link>
          <Link href="/clients">Clients</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <main>{children}</main>
        <Sponsors />
      </body>
    </html>
  );
}
