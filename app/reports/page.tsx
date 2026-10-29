"use client";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/money";
import { PageHeader } from "@/app/components/ui";

type Report = {
  period: string; income: number; expenses: number; netProfit: number;
  expensesByCategory: { name: string; spent: number }[];
};

export default function ReportsPage() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [r, setR] = useState<Report | null>(null);

  useEffect(() => {
    fetch(`/api/reports?period=${period}`).then((res) => res.json()).then(setR);
  }, [period]);

  return (
    <>
      <PageHeader title="Profit and loss" sub="Type a month like 2026-10, or a year like 2026." />

      <div className="row" style={{ marginBottom: 12 }}>
        <label>Month or year<input value={period} onChange={(e) => setPeriod(e.target.value.trim())} /></label>
      </div>

      {r && (
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>Income</strong><strong>{fmt(r.income)}</strong>
          </div>
          <h2 style={{ margin: "10px 0 0" }}>Expenses by category</h2>
          {r.expensesByCategory.map((c) => (
            <div key={c.name} className="row" style={{ justifyContent: "space-between" }}>
              <span>{c.name}</span><span>{fmt(c.spent)}</span>
            </div>
          ))}
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>Total expenses</strong><strong>{fmt(r.expenses)}</strong>
          </div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 20 }}>
            <strong>Net profit</strong><strong className={r.netProfit < 0 ? "over" : ""}>{fmt(r.netProfit)}</strong>
          </div>
        </div>
      )}
    </>
  );
}
