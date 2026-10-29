import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { inPeriod, spentByCategory } from "@/lib/finance";
import { totals } from "@/lib/money";

// Profit and loss for a month ("2026-10") or a year ("2026").
export async function GET(req: Request) {
  const period = new URL(req.url).searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const db = await readDb();

  // ZOMBIE: cash and accrual are mixed up. Invoices that are Sent but NOT paid are counted
  // as income, by issue date. The dashboard counts only paid invoices (by paid date), so
  // the two screens disagree. Pick one method (cash or accrual), use it everywhere, and say
  // which one the report uses.
  const counted = db.invoices.filter((i) => i.status !== "draft" && inPeriod(i.issueDate, period));
  const income = counted.reduce((sum, i) => sum + totals(i).total, 0);

  const byCategory = spentByCategory(db, period).filter((c) => c.spent !== 0);
  const expenses = byCategory.reduce((sum, c) => sum + c.spent, 0);
  return NextResponse.json({
    period,
    income,
    incomeInvoices: counted.map((i) => ({ number: i.number, status: i.status, total: totals(i).total })),
    expensesByCategory: byCategory.map((c) => ({ name: c.name, spent: c.spent })),
    expenses,
    netProfit: income - expenses,
  });
}
