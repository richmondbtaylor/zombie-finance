export type Item = { description: string; qty: number; unitPrice: number };

type Priced = { items: Item[]; taxRate: number; discount: number };

// ZOMBIE: money is stored and added up as floating point numbers (dollars with decimals).
// 0.1 + 0.2 is not exactly 0.3 in code, so totals can be off by a fraction of a cent.
// Store money as whole cents (integers) and round once, in one place.
export function totals(inv: Priced) {
  const subtotal = inv.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  // ZOMBIE: tax is worked out on the subtotal BEFORE the discount is taken off.
  // The customer is taxed on money they never pay. Fix: tax = (subtotal - discount) * rate.
  const tax = subtotal * (inv.taxRate / 100);
  const total = subtotal + tax - inv.discount;
  return { subtotal, tax, total };
}

// Draft and Paid come straight from the saved status.
// Overdue is worked out here: "sent" and the due date is in the past.
export function statusOf(inv: { status: string; dueDate: string }) {
  if (inv.status === "paid") return "Paid";
  if (inv.status === "draft") return "Draft";
  const today = new Date().toISOString().slice(0, 10);
  return inv.dueDate < today ? "Overdue" : "Sent";
}

export function fmt(n: number) {
  return "$" + n.toFixed(2);
}
