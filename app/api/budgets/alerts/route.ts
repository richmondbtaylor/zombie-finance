// ZOMBIE: budget alerts are not built. Nothing emails you when a category goes over budget.
// To do: after each new expense, compare spent to budget and send an email (Resend, Postmark...).
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Budget alerts: not built yet, see ZOMBIE.md." },
    { status: 501 },
  );
}
