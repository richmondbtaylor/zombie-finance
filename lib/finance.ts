import type { Db } from "@/lib/db";
import { totals, statusOf } from "@/lib/money";

// A "period" is "2026-10" (a month) or "2026" (a year). Dates are "2026-10-14".
// startsWith works for both.
export function inPeriod(date: string, period: string) {
  return !!period && date.startsWith(period);
}

// ZOMBIE: everything is in one currency (US dollars). There is no currency field on
// invoices, expenses or clients. To do: add a currency code and convert for reports.

// Cash basis: money counts when it is actually paid.
export function cashIncome(db: Db, period: string) {
  return db.invoices
    .filter((i) => i.status === "paid" && inPeriod(i.paidAt, period))
    .reduce((sum, i) => sum + totals(i).total, 0);
}

export function outstanding(db: Db) {
  return db.invoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + totals(i).total, 0);
}

export function expenseTotal(db: Db, period: string) {
  return db.expenses
    .filter((e) => inPeriod(e.date, period))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function spentByCategory(db: Db, period: string) {
  return db.categories.map((c) => {
    const spent = db.expenses
      .filter((e) => e.categoryId === c.id && inPeriod(e.date, period))
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...c, spent };
  });
}

// ---- Helpers for the charts, vendors, recurring expenses and client pages ----

// The last n months ending at "2026-10", oldest first: ["2026-08", "2026-09", "2026-10"].
export function lastMonths(month: string, n = 3) {
  const [y, m] = month.split("-").map(Number);
  const list: string[] = [];
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(Date.UTC(y, m - 1 - k, 1));
    list.push(d.toISOString().slice(0, 7));
  }
  return list;
}

// Income (paid invoices) and expenses for each of the last 3 months. Used by the dashboard bars.
export function monthlyTotals(db: Db, month: string) {
  return lastMonths(month).map((m) => ({
    month: m,
    income: cashIncome(db, m),
    expenses: expenseTotal(db, m),
  }));
}

// One row per vendor: how many expenses, how much was spent, and the last date.
export function vendorTotals(db: Db) {
  // ZOMBIE: vendors are grouped by the exact text. "Sunrise Office Supply" and
  // "sunrise office supply" show up as two different vendors with split totals.
  // Fix: compare trimmed, lowercase names (and let the user merge vendors).
  const map = new Map<string, { vendor: string; count: number; total: number; lastDate: string }>();
  for (const e of db.expenses) {
    const row = map.get(e.vendor) ?? { vendor: e.vendor, count: 0, total: 0, lastDate: "" };
    row.count += 1;
    row.total += e.amount;
    if (e.date > row.lastDate) row.lastDate = e.date;
    map.set(e.vendor, row);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

// "2026-01-31" plus one month is "2026-02-28" (the day is trimmed to fit the month).
export function addOneMonth(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const next = new Date(Date.UTC(y, m, Math.min(d, lastDay)));
  return next.toISOString().slice(0, 10);
}

// Expenses marked "monthly", one row per vendor (the latest one), with the next due date.
export function recurringList(db: Db) {
  // ZOMBIE: recurring expenses are only listed. Nothing creates the next expense when it
  // comes due, so the books miss it. To do: a scheduled job (Vercel Cron, a queue...) that
  // copies the expense on its due date, and a way to stop or edit the repeat.
  const latest = new Map<string, Db["expenses"][number]>();
  for (const e of db.expenses.filter((x) => x.recurring)) {
    const seen = latest.get(e.vendor);
    if (!seen || e.date > seen.date) latest.set(e.vendor, e);
  }
  const today = new Date().toISOString().slice(0, 10);
  return [...latest.values()]
    .map((e) => {
      const nextDue = addOneMonth(e.date);
      return {
        id: e.id,
        vendor: e.vendor,
        amount: e.amount,
        categoryName: db.categories.find((c) => c.id === e.categoryId)?.name ?? "Uncategorized",
        lastDate: e.date,
        nextDue,
        pastDue: nextDue < today,
      };
    })
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
}

// Everything the client page needs: the invoices and the money figures.
export function clientSummary(db: Db, clientId: string) {
  const client = db.clients.find((c) => c.id === clientId);
  if (!client) return null;
  const invoices = db.invoices
    .filter((i) => i.clientId === clientId)
    .map((i) => ({ ...i, status: statusOf(i), total: totals(i).total }))
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  const billed = invoices.filter((i) => i.status !== "Draft").reduce((sum, i) => sum + i.total, 0);
  const paid = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.total, 0);
  return { client, invoices, billed, paid, balance: billed - paid };
}
