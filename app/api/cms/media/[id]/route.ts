import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";
import { cloudinary, cloudinaryConfig } from "@/lib/cloudinary";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "media", action: "update" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }

  try {
    const [existing] = await sql`
      SELECT id, path, filename FROM media WHERE id = ${idNum} LIMIT 1
    ` as { id: number; path: string; filename: string | null }[] | [];
    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const body = await request.json();
    const filename = body.filename !== undefined ? body.filename : existing.filename;

    await sql`
      UPDATE media SET filename = ${filename} WHERE id = ${idNum}
    `;
    const [row] = await sql`
      SELECT id, path, filename, mime_type, public_id, created_at FROM media WHERE id = ${idNum} LIMIT 1
    `;
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/cms/media/[id] error:", err);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "media", action: "delete" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }

  try {
    const [row] = await sql`
      SELECT id, path, public_id FROM media WHERE id = ${idNum} LIMIT 1
    ` as { id: number; path: string; public_id: string | null }[] | [];
    if (!row) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (cloudinaryConfig.isConfigured && row.public_id) {
      try {
        const resourceType = row.path.includes("/raw/") ? "raw" : "image";
        await cloudinary.uploader.destroy(row.public_id, { resource_type: resourceType });
      } catch (err) {
        console.error("Cloudinary destroy error (continuing with DB delete):", err);
      }
    }

    await sql`DELETE FROM media WHERE id = ${idNum}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/cms/media/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
