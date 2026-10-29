import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { totals, statusOf } from "@/lib/money";

type Ctx = { params: Promise<{ id: string }> };

// ZOMBIE: no login and no owner check. Anyone with an id can read any invoice.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const client = db.clients.find((c) => c.id === inv.clientId) ?? null;
  return NextResponse.json({ ...inv, status: statusOf(inv), ...totals(inv), client });
}

// Used for "mark as paid", "mark as sent" and simple edits.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (body.action === "markPaid") {
    inv.status = "paid";
    inv.paidAt = new Date().toISOString().slice(0, 10);
  } else if (body.action === "markSent") {
    inv.status = "sent";
  } else {
    // ZOMBIE: no audit log. A sent or paid invoice can be changed (items, tax, due date)
    // and nothing records who changed what, or when. Add an audit_log table and
    // stop edits to sent invoices (issue a credit note instead).
    if (Array.isArray(body.items)) inv.items = body.items;
    if (body.taxRate !== undefined) inv.taxRate = Number(body.taxRate) || 0;
    if (body.discount !== undefined) inv.discount = Number(body.discount) || 0;
    if (body.dueDate) inv.dueDate = String(body.dueDate);
    if (body.number) inv.number = String(body.number);
  }
  await writeDb(db);
  return NextResponse.json({ ...inv, status: statusOf(inv), ...totals(inv) });
}
