import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "static_pages", action: "update" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid static page id" }, { status: 400 });
  }

  try {
    const [existing] = await sql`
      SELECT id, slug, title, full_html FROM static_pages WHERE id = ${idNum} LIMIT 1
    ` as { id: number; slug: string; title: string | null; full_html: string }[] | [];
    if (!existing) {
      return NextResponse.json({ error: "Static page not found" }, { status: 404 });
    }

    const body = await request.json();
    const slug = body.slug !== undefined ? body.slug?.trim() : existing.slug;
    const title = body.title !== undefined ? (body.title?.trim() ?? null) : existing.title;
    const full_html = body.full_html ?? body.fullHtml ?? existing.full_html;

    if (slug !== undefined && !slug) {
      return NextResponse.json({ error: "slug cannot be empty" }, { status: 400 });
    }
    if (typeof full_html !== "string") {
      return NextResponse.json({ error: "full_html must be a string" }, { status: 400 });
    }

    await sql`
      UPDATE static_pages
      SET slug = ${slug}, title = ${title}, full_html = ${full_html}, updated_at = now()
      WHERE id = ${idNum}
    `;
    const [row] = await sql`
      SELECT id, slug, title, full_html, created_at, updated_at
      FROM static_pages
      WHERE id = ${idNum}
      LIMIT 1
    `;
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/cms/static-pages/[id] error:", err);
    return NextResponse.json({ error: "Failed to update static page" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "static_pages", action: "delete" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid static page id" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM static_pages WHERE id = ${idNum}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/cms/static-pages/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete static page" }, { status: 500 });
  }
}
