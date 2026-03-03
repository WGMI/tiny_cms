import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { sql } from "@/lib/db";
import { cloudinary, cloudinaryConfig } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

const CLOUDINARY_FOLDER = "cms";

export async function GET() {
  const auth = await requireAuth({ permission: { resource: "media", action: "read" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await sql`
      SELECT id, path, filename, mime_type, public_id, created_at FROM media ORDER BY id DESC
    `;
    return NextResponse.json({ docs: rows });
  } catch (err) {
    console.error("GET /api/cms/media error:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth({ permission: { resource: "media", action: "create" } });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!cloudinaryConfig.isConfigured) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_* env vars." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { error: "File type not allowed. Use image (JPEG, PNG, GIF, WebP, SVG) or PDF." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${mime};base64,${base64}`;

    const resourceType = mime === "application/pdf" ? "raw" : "image";

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: CLOUDINARY_FOLDER,
      resource_type: resourceType,
    });

    const path = result.secure_url;
    const filename = file.name || result.public_id;
    const publicId = result.public_id;

    const rows = await sql`
      INSERT INTO media (path, filename, mime_type, public_id)
      VALUES (${path}, ${filename}, ${mime}, ${publicId})
      RETURNING id, path, filename, mime_type, public_id, created_at
    `;
    const inserted = (rows as Record<string, unknown>[])[0];
    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/media error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
