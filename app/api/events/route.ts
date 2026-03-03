import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { EventPublic } from "@/lib/events/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);
    const depth = Number(searchParams.get("depth")) || 0;
    const sort = searchParams.get("sort") || "-event_date";

    const orderDesc = sort.startsWith("-");

    const rows = orderDesc
      ? await sql`
          SELECT id, title, description, date, location, image_id, created_at, updated_at
          FROM events
          ORDER BY date DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT id, title, description, date, location, image_id, created_at, updated_at
          FROM events
          ORDER BY date ASC
          LIMIT ${limit}
        `;

    let mediaMap: Record<number, string> = {};
    if (depth === 1) {
      const imageIds = [...new Set((rows as { image_id: number | null }[]).map((r) => r.image_id).filter(Boolean))] as number[];
      if (imageIds.length > 0) {
        const mediaRows = await sql`
          SELECT id, path FROM media WHERE id = ANY(${imageIds})
        `;
        mediaMap = (mediaRows as { id: number; path: string }[]).reduce(
          (acc, m) => ({ ...acc, [m.id]: m.path }),
          {} as Record<number, string>
        );
      }
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const docs: EventPublic[] = (rows as Record<string, unknown>[]).map((row) => {
      const event: EventPublic = {
        id: row.id as number,
        title: row.title as string,
        description: row.description as string | null,
        date: row.date as string,
        event_date: row.date as string,
        location: row.location as string | null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      };
      if (depth === 1 && row.image_id) {
        const imageId = row.image_id as number;
        const url = mediaMap[imageId];
        event.image = { url: url?.startsWith("http") ? url : `${baseUrl}/api/media/${imageId}` };
        event.image_id = imageId;
      }
      return event;
    });

    return NextResponse.json({ docs });
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
