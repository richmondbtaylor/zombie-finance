"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/money";
import { PageHeader, Stat, Empty } from "@/app/components/ui";

type Vendor = { vendor: string; count: number; total: number; lastDate: string };

export default function VendorsPage() {
  const [rows, setRows] = useState<Vendor[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/vendors").then((r) => r.json()).then((list) => {
      setRows(list);
      setLoaded(true);
    });
  }, []);

  const spent = rows.reduce((sum, v) => sum + v.total, 0);

  return (
    <>
      <PageHeader title="Vendors" sub="Who you pay. Built from your expenses.">
        <Link href="/expenses" className="btn">Add expense</Link>
      </PageHeader>

      <div className="grid" style={{ marginBottom: 16 }}>
        <Stat label="Vendors" value={String(rows.length)} />
        <Stat label="Total spent" value={fmt(spent)} />
      </div>

      {loaded && rows.length === 0 ? (
        <Empty>No vendors yet. Add an expense and its vendor shows up here.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vendor</th><th>Expenses</th><th>Last expense</th><th className="num">Total spent</th></tr></thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.vendor}>
                  <td><Link href={`/vendors/${encodeURIComponent(v.vendor)}`}>{v.vendor}</Link></td>
                  <td>{v.count}</td>
                  <td>{v.lastDate}</td>
                  <td className="num">{fmt(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
