"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { totals, fmt } from "@/lib/money";
import { PageHeader } from "@/app/components/ui";

type Client = { id: string; name: string; company: string };
type Line = { description: string; qty: number; unitPrice: number };

const today = new Date().toISOString().slice(0, 10);

export default function NewInvoice() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [taxRate, setTaxRate] = useState(7);
  const [discount, setDiscount] = useState(0);
  const [recurring, setRecurring] = useState("none");
  const [items, setItems] = useState<Line[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((list: Client[]) => {
      setClients(list);
      if (list[0]) setClientId(list[0].id);
    });
  }, []);

  function setLine(i: number, patch: Partial<Line>) {
    setItems(items.map((l, n) => (n === i ? { ...l, ...patch } : l)));
  }

  const t = totals({ items, taxRate, discount });

  async function save(send: boolean) {
    setError("");
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, dueDate, taxRate, discount, recurring, items, send }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Could not save.");
    router.push(`/i/${data.id}`);
  }

  return (
    <>
      <PageHeader title="New invoice" sub="Pick a client, add lines, save." />

      <div className="card stack">
        <div className="grid">
          <label>Client
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
            </select>
          </label>
          <label>Due date<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
          <label>Tax rate (%)<input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} /></label>
          <label>Discount ($)<input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></label>
          <label>Repeat
            <select value={recurring} onChange={(e) => setRecurring(e.target.value)}>
              <option value="none">Does not repeat</option>
              <option value="monthly">Every month</option>
              <option value="weekly">Every week</option>
            </select>
          </label>
        </div>
        {recurring !== "none" && (
          <p className="muted">Not built yet, see ZOMBIE.md. The choice is saved but no repeat invoices are made.</p>
        )}

        <h2 style={{ margin: "10px 0 0" }}>Line items</h2>
        {items.map((l, i) => (
          <div key={i} className="row">
            <input style={{ flex: 3, minWidth: 160 }} placeholder="Description" value={l.description}
              onChange={(e) => setLine(i, { description: e.target.value })} />
            <input style={{ flex: 1, minWidth: 70 }} type="number" step="0.01" placeholder="Qty" value={l.qty}
              onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
            <input style={{ flex: 1, minWidth: 90 }} type="number" step="0.01" placeholder="Unit price" value={l.unitPrice}
              onChange={(e) => setLine(i, { unitPrice: Number(e.target.value) })} />
            <button className="ghost" type="button" disabled={items.length === 1}
              onClick={() => setItems(items.filter((_, n) => n !== i))}>Remove</button>
          </div>
        ))}
        <div>
          <button className="ghost" type="button"
            onClick={() => setItems([...items, { description: "", qty: 1, unitPrice: 0 }])}>Add line</button>
        </div>

        <div style={{ textAlign: "right" }}>
          <div>Subtotal: {fmt(t.subtotal)}</div>
          <div>Tax: {fmt(t.tax)}</div>
          <div>Discount: -{fmt(discount)}</div>
          <strong>Total: {fmt(t.total)}</strong>
        </div>

        <div className="row">
          <button type="button" onClick={() => save(false)}>Save as draft</button>
          <button type="button" className="ghost" onClick={() => save(true)}>Save and mark as sent</button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </>
  );
}
