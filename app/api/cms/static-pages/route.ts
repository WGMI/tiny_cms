import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";

export async function GET() {
  const auth = await requireAuth({ permission: { resource: "static_pages", action: "read" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await sql`
      SELECT id, slug, title, full_html, created_at, updated_at
      FROM static_pages
      ORDER BY slug
    `;
    return NextResponse.json({ docs: rows });
  } catch (err) {
    console.error("GET /api/cms/static-pages error:", err);
    return NextResponse.json({ error: "Failed to fetch static pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: { resource: "static_pages", action: "create" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const slug = body.slug?.trim();
    const title = body.title?.trim() ?? null;
    const full_html = body.full_html ?? body.fullHtml ?? "";

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    if (typeof full_html !== "string") {
      return NextResponse.json({ error: "full_html is required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO static_pages (slug, title, full_html)
      VALUES (${slug}, ${title}, ${full_html})
      RETURNING id, slug, title, full_html, created_at, updated_at
    `;
    const inserted = (rows as Record<string, unknown>[])[0];
    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/static-pages error:", err);
    return NextResponse.json({ error: "Failed to create static page" }, { status: 500 });
  }
}
