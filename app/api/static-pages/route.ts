import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sectionsToHtml } from "@/lib/pages/sections-to-html";
import type { Section } from "@/lib/pages/types";

interface StaticPagePublic {
  id: number;
  slug: string;
  title: string | null;
  fullHtml: string;
  full_html: string;
  created_at: string;
  updated_at: string;
}

function parseSections(fullHtmlRaw: string): Section[] {
  try {
    const parsed = JSON.parse(fullHtmlRaw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Section[];
  } catch {
    return [];
  }
}

function getImageMediaIds(sections: Section[]): number[] {
  const ids: number[] = [];
  for (const s of sections) {
    if (s.type === "image" && s.media_id) ids.push(s.media_id);
  }
  return ids;
}

async function resolveMediaUrls(mediaIds: number[]): Promise<Record<number, string>> {
  if (mediaIds.length === 0) return {};
  const ids = [...new Set(mediaIds)];
  const rows = await sql`SELECT id, path FROM media WHERE id = ANY(${ids})`;
  const map: Record<number, string> = {};
  for (const r of rows as { id: number; path: string }[]) {
    map[r.id] = r.path;
  }
  return map;
}

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
      FROM static_pages
      WHERE slug = ${trimmed}
      LIMIT 1
    `;
    const row = (rows as {
      id: number;
      slug: string;
      title: string | null;
      full_html: string;
      created_at: string;
      updated_at: string;
    }[])[0];
    if (!row) {
      return NextResponse.json({ docs: [] });
    }

    const sections = parseSections(row.full_html);
    const mediaIds = getImageMediaIds(sections);
    const mediaUrls = await resolveMediaUrls(mediaIds);
    const builtHtml = sectionsToHtml(sections, mediaUrls, row.title);

    const doc: StaticPagePublic = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      fullHtml: builtHtml,
      full_html: builtHtml,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    return NextResponse.json({ docs: [doc] });
  } catch (err) {
    console.error("GET /api/static-pages error:", err);
    return NextResponse.json({ error: "Failed to fetch static page" }, { status: 500 });
  }
}
