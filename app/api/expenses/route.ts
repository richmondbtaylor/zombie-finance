import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const vendor = url.searchParams.get("vendor") ?? "";
  const db = await readDb();
  const list = db.expenses
    .filter((e) => !month || e.date.startsWith(month))
    .filter((e) => !category || e.categoryId === category)
    .filter((e) => !vendor || e.vendor === vendor)
    .map((e) => ({ ...e, categoryName: db.categories.find((c) => c.id === e.categoryId)?.name ?? "Uncategorized" }))
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((sum, e) => sum + e.amount, 0);
  return NextResponse.json({ expenses: list, total });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const vendor = String(body.vendor ?? "").trim();
  if (!vendor) return NextResponse.json({ error: "Vendor is required." }, { status: 400 });
  const db = await readDb();
  if (!db.categories.some((c) => c.id === body.categoryId)) {
    return NextResponse.json({ error: "Pick a category." }, { status: 400 });
  }
  // ZOMBIE: no checks on the amount or the date. A negative amount is accepted, and so is a
  // date in the future (or one that is not a date at all). Validate on the server: amount
  // above zero, a real date, not in the future.
  const expense = {
    id: newId(),
    date: String(body.date || new Date().toISOString().slice(0, 10)),
    vendor,
    categoryId: String(body.categoryId),
    amount: Number(body.amount) || 0,
    paymentMethod: String(body.paymentMethod || "Card"),
    note: String(body.note ?? ""),
    recurring: body.recurring === true,
  };
  db.expenses.push(expense);
  await writeDb(db);
  return NextResponse.json(expense, { status: 201 });
}
