import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { clientSummary } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { PageHeader, Stat, Empty } from "@/app/components/ui";

export const dynamic = "force-dynamic";

// One client: their invoices, total billed, total paid and balance owed.
export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const summary = clientSummary(db, id);
  if (!summary) notFound();
  const { client, invoices, billed, paid, balance } = summary;

  return (
    <>
      <Link href="/clients" className="crumb">&larr; All clients</Link>
      <PageHeader title={client.company || client.name} sub={`${client.name} - ${client.email}`}>
        <Link href="/invoices/new" className="btn">New invoice</Link>
      </PageHeader>

      <div className="grid" style={{ marginBottom: 16 }}>
        <Stat label="Total billed" value={fmt(billed)} />
        <Stat label="Total paid" value={fmt(paid)} />
        <Stat label="Balance owed" value={fmt(balance)} danger={balance > 0} />
      </div>
      <p className="muted" style={{ marginTop: 0 }}>Billed counts every invoice that is not a draft.</p>

      <h2>Invoices</h2>
      {invoices.length === 0 ? (
        <Empty>No invoices for this client yet.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Number</th><th>Issued</th><th>Due</th><th>Status</th><th className="num">Total</th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td><Link href={`/i/${i.id}`}>{i.number}</Link></td>
                  <td>{i.issueDate}</td>
                  <td>{i.dueDate}</td>
                  <td><span className={`pill s-${i.status.toLowerCase()}`}>{i.status}</span></td>
                  <td className="num">{fmt(i.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
