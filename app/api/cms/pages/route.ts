import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";
import { sectionsToHtml } from "@/lib/pages/sections-to-html";
import type { Section } from "@/lib/pages/types";

async function resolveMediaUrls(mediaIds: number[]): Promise<Record<number, string>> {
  if (mediaIds.length === 0) return {};
  const ids = [...new Set(mediaIds)];
  const rows = await sql`SELECT id, path FROM media WHERE id = ANY(${ids})`;
  const map: Record<number, string> = {};
  for (const r of rows as { id: number; path: string }[]) {
    map[r.id] = r.path.startsWith("http") ? r.path : r.path;
  }
  return map;
}

function getImageMediaIds(sections: Section[]): number[] {
  const ids: number[] = [];
  for (const s of sections) {
    if (s.type === "image" && s.media_id) ids.push(s.media_id);
  }
  return ids;
}

export async function GET() {
  const auth = await requireAuth({ permission: { resource: "pages", action: "read" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await sql`
      SELECT id, slug, title, full_html, sections, created_at, updated_at
      FROM pages
      ORDER BY slug
    `;
    return NextResponse.json({ docs: rows });
  } catch (err) {
    console.error("GET /api/cms/pages error:", err);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: { resource: "pages", action: "create" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const slug = body.slug?.trim();
    const title = body.title?.trim() ?? null;
    const sections = body.sections;
    let full_html = body.full_html ?? body.fullHtml ?? "";

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    if (Array.isArray(sections) && sections.length > 0) {
      const mediaIds = getImageMediaIds(sections as Section[]);
      const mediaUrls = await resolveMediaUrls(mediaIds);
      full_html = sectionsToHtml(sections as Section[], mediaUrls, title);
    } else if (typeof full_html !== "string") {
      return NextResponse.json({ error: "full_html or sections is required" }, { status: 400 });
    }

    const sectionsValue = Array.isArray(sections) && sections.length > 0 ? (sections as Section[]) : null;
    const sectionsJson = sectionsValue !== null ? JSON.stringify(sectionsValue) : null;

    const rows = await sql`
      INSERT INTO pages (slug, title, full_html, sections)
      VALUES (${slug}, ${title}, ${full_html}, (${sectionsJson})::jsonb)
      RETURNING id, slug, title, full_html, sections, created_at, updated_at
    `;
    const inserted = (rows as Record<string, unknown>[])[0];
    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/pages error:", err);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
