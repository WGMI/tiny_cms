import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, title, subtitle, updated_at
      FROM events_page
      ORDER BY id
      LIMIT 1
    `;
    const docs = rows as { id: number; title: string | null; subtitle: string | null; updated_at: string | null }[];
    return NextResponse.json({ docs });
  } catch (err) {
    console.error("GET /api/events-page error:", err);
    return NextResponse.json({ error: "Failed to fetch events page" }, { status: 500 });
  }
}
