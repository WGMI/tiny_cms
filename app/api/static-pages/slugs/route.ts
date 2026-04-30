import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT slug
      FROM static_pages
      ORDER BY slug
    `;
    const docs = (rows as { slug: string }[]).map((row) => row.slug);
    return NextResponse.json({ docs });
  } catch (err) {
    console.error("GET /api/static-pages/slugs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch static page slugs" },
      { status: 500 }
    );
  }
}
