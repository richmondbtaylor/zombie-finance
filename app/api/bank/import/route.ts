// ZOMBIE: CSV import of bank transactions is not built. The button lands here and gets a 501.
// To do: accept a CSV file, check every row (date, amount, vendor), skip duplicates,
// and let the user pick a category for each row before saving.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "CSV import: not built yet, see ZOMBIE.md." },
    { status: 501 },
  );
}
