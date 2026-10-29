// ZOMBIE: "Pay now" on the public invoice lands here and gets a 501. Stripe is not connected.
// To do: create a Stripe Checkout Session for this invoice's total (in cents), return its URL,
// and add a webhook that marks the invoice paid. Never handle card numbers yourself (PCI).
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Online payment is not built yet. Stripe is not connected. See ZOMBIE.md." },
    { status: 501 },
  );
}
