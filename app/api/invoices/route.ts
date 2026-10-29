import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { totals, statusOf } from "@/lib/money";

// ZOMBIE: no login. Anyone who can reach this URL can list every invoice.
export async function GET() {
  const db = await readDb();
  const list = db.invoices.map((inv) => {
    const client = db.clients.find((c) => c.id === inv.clientId);
    return {
      ...inv,
      clientName: client ? client.company || client.name : "Unknown client",
      status: statusOf(inv),
      ...totals(inv),
    };
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const db = await readDb();

  if (!db.clients.some((c) => c.id === body.clientId)) {
    return NextResponse.json({ error: "Pick a client." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Add at least one line item." }, { status: 400 });
  }

  // ZOMBIE: invoice numbers can repeat. The number is "how many invoices this client has, plus one",
  // so two clients both get INV-0001. Tax law wants a unique, unbroken sequence.
  // Also, a typed-in number is accepted without checking if it is already used.
  const clientCount = db.invoices.filter((i) => i.clientId === body.clientId).length;
  const number = String(body.number || "").trim() || "INV-" + String(clientCount + 1).padStart(4, "0");

  const invoice = {
    id: newId(),
    number,
    clientId: String(body.clientId),
    issueDate: String(body.issueDate || new Date().toISOString().slice(0, 10)),
    dueDate: String(body.dueDate || new Date().toISOString().slice(0, 10)),
    items: body.items.map((i: { description?: string; qty?: number; unitPrice?: number }) => ({
      description: String(i.description ?? ""),
      qty: Number(i.qty) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    })),
    taxRate: Number(body.taxRate) || 0,
    discount: Number(body.discount) || 0,
    status: body.send ? "sent" : "draft",
    paidAt: "",
    // ZOMBIE: recurring invoices. This value is saved but nothing ever reads it.
    // To do: a scheduled job that copies the invoice on the chosen schedule.
    recurring: String(body.recurring || "none"),
  };
  db.invoices.push(invoice);
  await writeDb(db);
  return NextResponse.json({ ...invoice, status: statusOf(invoice), ...totals(invoice) }, { status: 201 });
}
