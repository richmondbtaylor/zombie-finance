import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { totals, statusOf, fmt } from "@/lib/money";
import InvoiceActions from "./InvoiceActions";

export const dynamic = "force-dynamic";

// The public, printable invoice. Anyone with the link sees it.
// ZOMBIE: no login, and the id is just a timestamp or a short number. Anyone can try
// /i/1001, /i/1002... and read other people's invoices. Use long random ids (or signed links).
export default async function PublicInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) notFound();
  const client = db.clients.find((c) => c.id === inv.clientId);
  const t = totals(inv);
  const status = statusOf(inv);

  return (
    <>
      <div className="paper">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Invoice {inv.number}</h1>
            <span className={`pill s-${status.toLowerCase()}`}>{status}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Your Business Name</strong>
            <div className="muted">123 Example Street, Miami, FL</div>
            <div className="muted">billing@example.com</div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", margin: "24px 0", alignItems: "flex-start" }}>
          <div>
            <div className="muted">Billed to</div>
            <strong>{client?.company || client?.name}</strong>
            <div>{client?.name}</div>
            <div className="muted">{client?.email}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><span className="muted">Issued:</span> {inv.issueDate}</div>
            <div><span className="muted">Due:</span> {inv.dueDate}</div>
          </div>
        </div>

        <div className="table-wrap">
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>
          <tbody>
            {inv.items.map((l, n) => (
              <tr key={n}>
                <td>{l.description}</td>
                <td>{l.qty}</td>
                <td>{fmt(l.unitPrice)}</td>
                <td>{fmt(l.qty * l.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div style={{ textAlign: "right", marginTop: 16, display: "grid", gap: 4 }}>
          <div>Subtotal: {fmt(t.subtotal)}</div>
          <div>Tax ({inv.taxRate}%): {fmt(t.tax)}</div>
          {inv.discount > 0 && <div>Discount: -{fmt(inv.discount)}</div>}
          <div style={{ fontSize: 22, fontWeight: 700 }}>Total due: {fmt(t.total)}</div>
          {inv.paidAt && <div className="muted">Paid on {inv.paidAt}</div>}
        </div>
      </div>

      <InvoiceActions id={inv.id} paid={status === "Paid"} />
    </>
  );
}
