// ZOMBIE: bank sync is not built. "Connect your bank" lands here and gets a 501.
// To do: use Plaid Link (or similar), store the access token encrypted on the server,
// and pull transactions. Bank connections need their own security review (see ZOMBIE.md).
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Bank sync: not built yet, see ZOMBIE.md." },
    { status: 501 },
  );
}
