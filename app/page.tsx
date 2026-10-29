"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/money";
import { PageHeader, Stat, Empty } from "@/app/components/ui";

type Budget = { id: string; name: string; monthlyBudget: number; spent: number };
type MonthRow = { month: string; income: number; expenses: number };
type Summary = {
  month: string; income: number; expenses: number; profit: number;
  outstanding: number; budgets: Budget[]; months: MonthRow[];
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthName(m: string) {
  return MONTH_NAMES[Number(m.slice(5, 7)) - 1] ?? m;
}

export default function Dashboard() {
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/summary").then((r) => r.json()).then(setS);
  }, []);

  if (!s) return <p className="muted">Loading...</p>;

  // Bars are drawn as a share of the biggest number on the chart.
  const maxMonth = Math.max(1, ...s.months.flatMap((m) => [m.income, m.expenses]));
  const spending = s.budgets.filter((b) => b.spent > 0).sort((a, b) => b.spent - a.spent);
  const maxSpent = Math.max(1, ...spending.map((b) => b.spent));

  return (
    <>
      <PageHeader title="Dashboard" sub={`This month: ${s.month}`}>
        <Link href="/invoices/new" className="btn">New invoice</Link>
        <Link href="/expenses" className="btn ghost">Add expense</Link>
      </PageHeader>

      <div className="grid">
        <Stat label="Income (paid invoices)" value={fmt(s.income)} />
        <Stat label="Expenses" value={fmt(s.expenses)} />
        <Stat label="Profit" value={fmt(s.profit)} danger={s.profit < 0} />
        <Stat label="Outstanding invoices" value={fmt(s.outstanding)} />
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <strong>Income vs expenses</strong>
          <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>Last 3 months</div>
          <div className="legend">
            <span><span className="dot income" />Income</span>
            <span><span className="dot expense" />Expenses</span>
          </div>
          <div className="vchart">
            {s.months.map((m) => (
              <div key={m.month} className="vgroup">
                <div className="vpair">
                  <div className="vbar income" style={{ height: `${(m.income / maxMonth) * 100}%` }} title={`Income ${fmt(m.income)}`} />
                  <div className="vbar expense" style={{ height: `${(m.expenses / maxMonth) * 100}%` }} title={`Expenses ${fmt(m.expenses)}`} />
                </div>
                <div className="vlabel">{monthName(m.month)}</div>
                <div className="vvalues">{fmt(m.income)}</div>
                <div className="vvalues">{fmt(m.expenses)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <strong>Spending by category</strong>
          <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>This month</div>
          {spending.length === 0 && <Empty>No spending this month yet.</Empty>}
          <div className="hchart">
            {spending.map((b) => (
              <div key={b.id} className="hrow">
                <span>{b.name}</span>
                <div className="htrack"><div className="hfill" style={{ width: `${(b.spent / maxSpent) * 100}%` }} /></div>
                <span className="hval">{fmt(b.spent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2>Budget status</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Category</th><th>Spent</th><th>Budget</th><th>Status</th></tr></thead>
          <tbody>
            {s.budgets.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{fmt(b.spent)}</td>
                <td>{fmt(b.monthlyBudget)}</td>
                <td className={b.spent > b.monthlyBudget ? "over" : ""}>
                  {b.spent > b.monthlyBudget ? "Over budget" : "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Go to</h2>
      <div className="row">
        <Link href="/invoices" className="btn ghost">Invoices</Link>
        <Link href="/expenses" className="btn ghost">Expenses</Link>
        <Link href="/vendors" className="btn ghost">Vendors</Link>
        <Link href="/budgets" className="btn ghost">Budgets</Link>
        <Link href="/reports" className="btn ghost">Profit and loss</Link>
        <Link href="/clients" className="btn ghost">Clients</Link>
        <Link href="/pricing" className="btn ghost">Pricing</Link>
      </div>
    </>
  );
}
