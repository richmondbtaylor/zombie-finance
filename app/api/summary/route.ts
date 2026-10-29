import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { cashIncome, expenseTotal, monthlyTotals, outstanding, spentByCategory } from "@/lib/finance";

// ZOMBIE: no login. Anyone who can reach this URL can read the books.
export async function GET(req: Request) {
  const month = new URL(req.url).searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const db = await readDb();
  const income = cashIncome(db, month);
  const expenses = expenseTotal(db, month);
  return NextResponse.json({
    month,
    income,
    expenses,
    profit: income - expenses,
    outstanding: outstanding(db),
    budgets: spentByCategory(db, month),
    months: monthlyTotals(db, month),
  });
}
