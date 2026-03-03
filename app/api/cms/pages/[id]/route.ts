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
    map[r.id] = r.path;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "pages", action: "update" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid page id" }, { status: 400 });
  }

  try {
    const [existing] = await sql`
      SELECT id, slug, title, full_html, sections FROM pages WHERE id = ${idNum} LIMIT 1
    ` as { id: number; slug: string; title: string | null; full_html: string; sections: unknown }[] | [];
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const slug = body.slug !== undefined ? body.slug?.trim() : existing.slug;
    const title = body.title !== undefined ? (body.title?.trim() ?? null) : existing.title;

    if (slug !== undefined && !slug) {
      return NextResponse.json({ error: "slug cannot be empty" }, { status: 400 });
    }

    let full_html = existing.full_html;
    let sectionsValue: unknown = existing.sections;

    if (Array.isArray(body.sections) && body.sections.length > 0) {
      const sections = body.sections as Section[];
      const mediaIds = getImageMediaIds(sections);
      const mediaUrls = await resolveMediaUrls(mediaIds);
      full_html = sectionsToHtml(sections, mediaUrls, title);
      sectionsValue = sections;
    } else if (body.full_html !== undefined || body.fullHtml !== undefined) {
      full_html = body.full_html ?? body.fullHtml ?? existing.full_html;
      sectionsValue = null;
    }

    const sectionsJson = sectionsValue != null ? JSON.stringify(sectionsValue) : null;

    await sql`
      UPDATE pages SET slug = ${slug}, title = ${title}, full_html = ${full_html}, sections = (${sectionsJson})::jsonb, updated_at = now()
      WHERE id = ${idNum}
    `;
    const [row] = await sql`
      SELECT id, slug, title, full_html, sections, created_at, updated_at FROM pages WHERE id = ${idNum} LIMIT 1
    `;
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/cms/pages/[id] error:", err);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth({ permission: { resource: "pages", action: "delete" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid page id" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM pages WHERE id = ${idNum}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/cms/pages/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
