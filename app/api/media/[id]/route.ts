import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { sql } from "@/lib/db";

// 1x1 transparent GIF so <img> never breaks when file is missing
const PLACEHOLDER_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, path, mime_type FROM media WHERE id = ${idNum} LIMIT 1
    `;
    const row = (rows as { id: number; path: string; mime_type: string | null }[])[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const path = row.path.startsWith("http") ? row.path : row.path.startsWith("/") ? row.path : `/${row.path}`;

    // External URL: redirect so the client loads from there
    if (path.startsWith("http")) {
      return NextResponse.redirect(path, 302);
    }

    // Local path: serve file from public/ so <img src=".../api/media/1"> works without redirect
    const filePath = join(process.cwd(), "public", path);
    const mime = row.mime_type || "application/octet-stream";

    try {
      const bytes = await readFile(filePath);
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // File missing (e.g. old seed path or deleted file): return transparent pixel so img doesn't break
      return new NextResponse(PLACEHOLDER_GIF, {
        status: 200,
        headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
      });
    }
  } catch (err) {
    console.error("GET /api/media/[id] error:", err);
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
