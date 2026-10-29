"use client";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/money";
import { PageHeader } from "@/app/components/ui";

type Budget = { id: string; name: string; monthlyBudget: number; spent: number };

export default function BudgetsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<Budget[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await (await fetch(`/api/summary?month=${month}`)).json();
    setRows(data.budgets);
  }
  useEffect(() => { load(); }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(id: string, value: string) {
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyBudget: value }),
    });
    load();
  }

  async function alerts() {
    const res = await fetch("/api/budgets/alerts", { method: "POST" });
    setMessage((await res.json()).error ?? "Done.");
  }

  return (
    <>
      <PageHeader title="Budgets" sub="A monthly budget for each category. Red means over budget." />

      <div className="row" style={{ marginBottom: 12 }}>
        <label>Month<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
        {/* ZOMBIE: budget alerts are not built. Nothing emails anyone when a category goes over. */}
        <button className="ghost" onClick={alerts}>Email me when over budget</button>
      </div>
      {message && <p className="error">{message}</p>}

      <div className="stack">
        {rows.map((b) => {
          const pct = b.monthlyBudget > 0 ? Math.min(100, (b.spent / b.monthlyBudget) * 100) : 100;
          const over = b.spent > b.monthlyBudget;
          return (
            <div key={b.id} className="card stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{b.name}</strong>
                <span className={over ? "over" : "muted"}>{fmt(b.spent)} of {fmt(b.monthlyBudget)}</span>
              </div>
              <div className="bar"><div className={over ? "fill over-fill" : "fill"} style={{ width: `${pct}%` }} /></div>
              <label>Monthly budget ($)
                <input type="number" step="1" defaultValue={b.monthlyBudget} key={b.id + b.monthlyBudget}
                  onBlur={(e) => save(b.id, e.target.value)} />
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
}
