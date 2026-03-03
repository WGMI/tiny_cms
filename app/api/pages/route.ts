import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { PagePublic } from "@/lib/pages/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug =
      searchParams.get("slug") ?? searchParams.get("where[slug][equals]") ?? "";
    const trimmed = slug.trim();
    if (!trimmed) {
      return NextResponse.json({ docs: [] });
    }

    const rows = await sql`
      SELECT id, slug, title, full_html, created_at, updated_at
      FROM pages
      WHERE slug = ${trimmed}
      LIMIT 1
    `;
    const row = (rows as { id: number; slug: string; title: string | null; full_html: string; created_at: string; updated_at: string }[])[0];
    if (!row) {
      return NextResponse.json({ docs: [] });
    }

    const doc: PagePublic = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      fullHtml: row.full_html,
      full_html: row.full_html,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    return NextResponse.json({ docs: [doc] });
  } catch (err) {
    console.error("GET /api/pages error:", err);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
