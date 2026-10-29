import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.clients);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const db = await readDb();
  const client = {
    id: newId(),
    name,
    company: String(body.company ?? "").trim(),
    email: String(body.email ?? "").trim(),
  };
  db.clients.push(client);
  await writeDb(db);
  return NextResponse.json(client, { status: 201 });
}
