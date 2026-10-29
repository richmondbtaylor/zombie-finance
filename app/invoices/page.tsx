"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/money";
import { PageHeader } from "@/app/components/ui";

type Row = {
  id: string; number: string; clientName: string; issueDate: string;
  dueDate: string; status: string; total: number;
};

export default function InvoiceList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/invoices");
    setRows(await res.json());
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markPaid" }),
    });
    load();
  }

  const owed = rows.filter((r) => r.status === "Sent" || r.status === "Overdue")
    .reduce((sum, r) => sum + r.total, 0);

  return (
    <>
      <PageHeader title="Invoices" sub={<>Outstanding right now: <strong>{fmt(owed)}</strong></>}>
        <Link href="/invoices/new" className="btn">New invoice</Link>
      </PageHeader>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Number</th><th>Client</th><th>Due</th><th>Status</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/i/${r.id}`}>{r.number}</Link></td>
                <td>{r.clientName}</td>
                <td>{r.dueDate}</td>
                <td><span className={`pill s-${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>{fmt(r.total)}</td>
                <td>
                  {r.status !== "Paid" && (
                    <button className="ghost small" onClick={() => markPaid(r.id)}>Mark paid</button>
                  )}
                </td>
              </tr>
            ))}
            {loaded && rows.length === 0 && (
              <tr><td colSpan={6} className="muted">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
