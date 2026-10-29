import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// ZOMBIE: deleting an expense is permanent. There is no "are you sure?" and no audit trail
// (who deleted what, and when). Records must be kept for years. Mark it deleted instead
// of removing it, and write a line to an audit log.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const before = db.expenses.length;
  db.expenses = db.expenses.filter((e) => e.id !== id);
  if (db.expenses.length === before) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

// Turn "repeats every month" on or off for one expense.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const expense = db.expenses.find((e) => e.id === id);
  if (!expense) return NextResponse.json({ error: "Not found." }, { status: 404 });
  expense.recurring = body.recurring === true;
  await writeDb(db);
  return NextResponse.json(expense);
}
