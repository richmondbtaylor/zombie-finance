"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Empty } from "@/app/components/ui";

type Client = { id: string; name: string; company: string; email: string };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ name: "", company: "", email: "" });
  const [error, setError] = useState("");

  async function load() {
    setClients(await (await fetch("/api/clients")).json());
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not add client.");
      return;
    }
    setForm({ name: "", company: "", email: "" });
    load();
  }

  return (
    <>
      <PageHeader title="Clients" sub="The people and businesses you bill. Click a company to see its invoices and balance." />

      <form onSubmit={add} className="card stack" style={{ marginBottom: 20 }}>
        <strong>Add a client</strong>
        <div className="grid">
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
          <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        </div>
        <div><button type="submit">Add client</button></div>
        {error && <p className="error">{error}</p>}
      </form>

      {clients.length === 0 ? (
        <Empty>No clients yet. Add your first one above.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Email</th><th></th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><Link href={`/clients/${c.id}`}>{c.company || c.name}</Link></td>
                  <td>{c.email}</td>
                  <td><Link href={`/clients/${c.id}`} className="btn ghost small">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
