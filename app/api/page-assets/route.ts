import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface PageAssetDoc {
  id: number;
  slug: string;
  name: string;
  asset_type: string;
  description: string | null;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
  config: unknown;
  version: number;
  is_active: boolean;
  sort_order: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetSlug = (searchParams.get("slug") ?? "").trim();
    const pageSlug = (searchParams.get("pageSlug") ?? searchParams.get("page_slug") ?? "").trim();

    if (pageSlug) {
      const rows = await sql`
        SELECT
          a.id,
          a.slug,
          a.name,
          a.asset_type,
          a.description,
          a.html_content,
          a.css_content,
          a.js_content,
          a.config,
          a.version,
          a.is_active,
          p.sort_order
        FROM pages pg
        INNER JOIN page_asset_placements p ON p.page_id = pg.id
        INNER JOIN page_assets a ON a.id = p.asset_id
        WHERE pg.slug = ${pageSlug}
          AND p.is_enabled = TRUE
          AND a.is_active = TRUE
        ORDER BY p.sort_order ASC, a.id ASC
      `;

      return NextResponse.json({
        page_slug: pageSlug,
        docs: rows as PageAssetDoc[],
      });
    }

    if (assetSlug) {
      const rows = await sql`
        SELECT
          id,
          slug,
          name,
          asset_type,
          description,
          html_content,
          css_content,
          js_content,
          config,
          version,
          is_active,
          NULL::INTEGER AS sort_order
        FROM page_assets
        WHERE slug = ${assetSlug}
          AND is_active = TRUE
        LIMIT 1
      `;

      return NextResponse.json({ docs: rows as PageAssetDoc[] });
    }

    const rows = await sql`
      SELECT
        id,
        slug,
        name,
        asset_type,
        description,
        html_content,
        css_content,
        js_content,
        config,
        version,
        is_active,
        NULL::INTEGER AS sort_order
      FROM page_assets
      WHERE is_active = TRUE
      ORDER BY id DESC
    `;

    return NextResponse.json({ docs: rows as PageAssetDoc[] });
  } catch (err) {
    console.error("GET /api/page-assets error:", err);
    return NextResponse.json(
      { error: "Failed to fetch page assets" },
      { status: 500 }
    );
  }
}
