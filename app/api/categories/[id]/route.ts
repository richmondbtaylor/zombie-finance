import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// Set the monthly budget for one category.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const cat = db.categories.find((c) => c.id === id);
  if (!cat) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const budget = Number(body.monthlyBudget);
  if (!Number.isFinite(budget) || budget < 0) {
    return NextResponse.json({ error: "Budget must be a number, zero or more." }, { status: 400 });
  }
  cat.monthlyBudget = budget;
  await writeDb(db);
  return NextResponse.json(cat);
}
