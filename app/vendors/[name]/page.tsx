import Link from "next/link";
import { readDb } from "@/lib/db";
import { fmt } from "@/lib/money";
import { PageHeader, Stat, Empty } from "@/app/components/ui";

export const dynamic = "force-dynamic";

// One vendor and every expense paid to it. The name must match exactly (see vendorTotals in lib/finance.ts).
export default async function VendorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const vendor = decodeURIComponent(name);
  const db = await readDb();
  const expenses = db.expenses
    .filter((e) => e.vendor === vendor)
    .map((e) => ({ ...e, categoryName: db.categories.find((c) => c.id === e.categoryId)?.name ?? "Uncategorized" }))
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <Link href="/vendors" className="crumb">&larr; All vendors</Link>
      <PageHeader title={vendor} sub="Every expense paid to this vendor." />

      <div className="grid" style={{ marginBottom: 16 }}>
        <Stat label="Total spent" value={fmt(total)} />
        <Stat label="Expenses" value={String(expenses.length)} />
      </div>

      {expenses.length === 0 ? (
        <Empty>No expenses for this vendor.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Paid with</th><th>Note</th><th>Monthly</th><th className="num">Amount</th></tr></thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td><td>{e.categoryName}</td><td>{e.paymentMethod}</td><td>{e.note}</td>
                  <td>{e.recurring ? "Yes" : ""}</td>
                  <td className="num">{fmt(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
