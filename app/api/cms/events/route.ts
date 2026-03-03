import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";

export async function GET() {
  const auth = await requireAuth({ permission: { resource: "events", action: "read" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await sql`
      SELECT e.id, e.title, e.description, e.date, e.location, e.image_id, e.created_at, e.updated_at
      FROM events e
      ORDER BY e.date DESC
    `;
    return NextResponse.json({ docs: rows });
  } catch (err) {
    console.error("GET /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: { resource: "events", action: "create" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { title, description, date, location, image_id } = body;
    if (!title || !date) {
      return NextResponse.json(
        { error: "title and date are required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO events (title, description, date, location, image_id)
      VALUES (${title}, ${description ?? null}, ${date}, ${location ?? null}, ${image_id ? Number(image_id) : null})
      RETURNING id, title, description, date, location, image_id, created_at, updated_at
    `;
    const inserted = (rows as Record<string, unknown>[])[0];
    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
