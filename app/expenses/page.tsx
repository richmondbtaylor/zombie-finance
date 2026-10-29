"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/money";
import { PageHeader, Stat, Empty } from "@/app/components/ui";

type Category = { id: string; name: string };
type Expense = {
  id: string; date: string; vendor: string; categoryName: string;
  amount: number; paymentMethod: string; note: string; recurring: boolean;
};
type Recurring = {
  id: string; vendor: string; amount: number; categoryName: string;
  lastDate: string; nextDue: string; pastDue: boolean;
};

const today = new Date().toISOString().slice(0, 10);
const blank = { date: today, vendor: "", categoryId: "", amount: "", paymentMethod: "Card", note: "", recurring: false };

export default function ExpensesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Expense[]>([]);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [total, setTotal] = useState(0);
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");

  async function load() {
    const q = new URLSearchParams({ month, category });
    const data = await (await fetch(`/api/expenses?${q}`)).json();
    setRows(data.expenses);
    setTotal(data.total);
    setRecurring(await (await fetch("/api/recurring")).json());
  }
  useEffect(() => { load(); }, [month, category]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((list: Category[]) => {
      setCategories(list);
      setForm((f) => ({ ...f, categoryId: list[0]?.id ?? "" }));
    });
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return setMessage((await res.json()).error ?? "Could not add expense.");
    setForm({ ...blank, categoryId: form.categoryId });
    load();
  }

  async function remove(id: string) {
    // ZOMBIE: no "are you sure?" and no audit trail. One click and the expense is gone for good.
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    load();
  }

  async function setMonthly(id: string, value: boolean) {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurring: value }),
    });
    load();
  }

  // Both bank routes are stubs that return 501, so these buttons only show the message.
  async function notBuilt(path: string) {
    const res = await fetch(path, { method: "POST" });
    setMessage((await res.json()).error ?? "Not built yet, see ZOMBIE.md");
  }

  return (
    <>
      <PageHeader title="Expenses" sub="What the business spent.">
        <button type="button" className="ghost" onClick={() => notBuilt("/api/bank/connect")}>Connect your bank</button>
        <button type="button" className="ghost" onClick={() => notBuilt("/api/bank/import")}>Import bank CSV</button>
      </PageHeader>

      <form onSubmit={add} className="card stack" style={{ marginBottom: 20 }}>
        <strong>Add an expense</strong>
        <div className="grid">
          <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label>Vendor<input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></label>
          <label>Category
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Amount ($)<input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
          <label>Payment method
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option>Card</option><option>Bank transfer</option><option>Cash</option><option>Check</option>
            </select>
          </label>
          <label>Note<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
          {/* ZOMBIE: receipt upload is listed but turned off. To do: store the file (Supabase Storage, S3...),
              limit type and size, and link it to the expense. Keep receipts as long as the record. */}
          <label>Receipt (photo or PDF)<input type="file" disabled /></label>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
          Repeats every month
        </label>
        <div className="row">
          <button type="submit">Add expense</button>
          <span className="muted">Receipt upload: not built yet, see ZOMBIE.md.</span>
        </div>
        {message && <p className="error">{message}</p>}
      </form>

      <h2 style={{ marginTop: 0 }}>Recurring</h2>
      <p className="sub" style={{ marginBottom: 12 }}>Expenses marked as monthly, with the next date each one is due.</p>
      {recurring.length === 0 ? (
        <Empty>No recurring expenses yet. Tick &quot;Repeats every month&quot; when you add one.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vendor</th><th>Category</th><th>Amount</th><th>Last paid</th><th>Next due</th></tr></thead>
            <tbody>
              {recurring.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/vendors/${encodeURIComponent(r.vendor)}`}>{r.vendor}</Link></td>
                  <td>{r.categoryName}</td>
                  <td>{fmt(r.amount)}</td>
                  <td>{r.lastDate}</td>
                  <td>{r.nextDue}{r.pastDue && <span className="over"> (past due)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>All expenses</h2>
      <div className="grid" style={{ marginBottom: 14 }}>
        <Stat label="Total for this filter" value={fmt(total)} />
        <Stat label="Expenses shown" value={String(rows.length)} />
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <label>Month<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
        <label>Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <strong style={{ marginLeft: "auto" }}>Total: {fmt(total)}</strong>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Paid with</th><th>Note</th><th>Monthly</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td><Link href={`/vendors/${encodeURIComponent(r.vendor)}`}>{r.vendor}</Link></td>
                <td>{r.categoryName}</td>
                <td>{fmt(r.amount)}</td><td>{r.paymentMethod}</td><td>{r.note}</td>
                <td>
                  <button className="ghost small" onClick={() => setMonthly(r.id, !r.recurring)}>
                    {r.recurring ? "Yes (turn off)" : "No (turn on)"}
                  </button>
                </td>
                <td><button className="ghost small" onClick={() => remove(r.id)}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="muted">No expenses.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
