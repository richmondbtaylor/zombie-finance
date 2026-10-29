import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { clientSummary } from "@/lib/finance";

type Ctx = { params: Promise<{ id: string }> };

// One client with their invoices, total billed, total paid and balance owed.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const summary = clientSummary(db, id);
  if (!summary) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(summary);
}
