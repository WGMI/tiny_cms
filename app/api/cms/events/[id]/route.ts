import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "events", action: "update" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const [existing] = await sql`
      SELECT id, title, description, date, location, image_id FROM events WHERE id = ${idNum} LIMIT 1
    ` as { id: number; title: string; description: string | null; date: string; location: string | null; image_id: number | null }[];
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const title = body.title !== undefined ? body.title : existing.title;
    const description = body.description !== undefined ? body.description : existing.description;
    const date = body.date !== undefined ? body.date : existing.date;
    const location = body.location !== undefined ? body.location : existing.location;
    const image_id = body.image_id !== undefined ? (body.image_id ? Number(body.image_id) : null) : existing.image_id;

    await sql`
      UPDATE events SET title = ${title}, description = ${description}, date = ${date}, location = ${location}, image_id = ${image_id}, updated_at = now()
      WHERE id = ${idNum}
    `;
    const [row] = await sql`
      SELECT id, title, description, date, location, image_id, created_at, updated_at
      FROM events WHERE id = ${idNum} LIMIT 1
    `;
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/cms/events/[id] error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "events", action: "delete" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  try {
    const result = await sql`DELETE FROM events WHERE id = ${idNum}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/cms/events/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
