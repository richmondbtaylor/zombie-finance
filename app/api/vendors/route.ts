import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { vendorTotals } from "@/lib/finance";

// Every vendor with how much was spent. Built from the expenses.
export async function GET() {
  const db = await readDb();
  return NextResponse.json(vendorTotals(db));
}
