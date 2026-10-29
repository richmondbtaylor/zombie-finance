"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceActions({ id, paid }: { id: string; paid: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function payNow() {
    // ZOMBIE: this calls the Stripe stub, which always answers 501.
    const res = await fetch(`/api/invoices/${id}/pay`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
    else setMessage(data.error ?? "Payment failed.");
  }

  async function markPaid() {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markPaid" }),
    });
    router.refresh();
  }

  return (
    <div className="actions stack" style={{ maxWidth: 760, margin: "16px auto" }}>
      <div className="row">
        {!paid && <button onClick={payNow}>Pay now</button>}
        {!paid && <button className="ghost" onClick={markPaid}>Mark as paid (by hand)</button>}
        <button className="ghost" onClick={() => window.print()}>Print</button>
        {/* ZOMBIE: "Send by email" and "Download PDF" are not built. They only show a message. */}
        <button className="ghost" onClick={() => setMessage("Send by email: not built yet, see ZOMBIE.md.")}>Send by email</button>
        <button className="ghost" onClick={() => setMessage("Download PDF: not built yet, see ZOMBIE.md.")}>Download PDF</button>
      </div>
      {message && <p className="error">{message}</p>}
    </div>
  );
}
