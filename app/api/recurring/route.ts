import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { recurringList } from "@/lib/finance";

// Expenses marked "monthly", with the next due date.
export async function GET() {
  const db = await readDb();
  return NextResponse.json(recurringList(db));
}
