import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { hasPermission } from "@/lib/auth/permissions";
import { sql } from "@/lib/db";
import { MediaList } from "./MediaList";

export default async function MediaPage() {
  const session = await getSession();
  if (!session) redirect("/cms/login");

  const canRead = hasPermission(session.permissions, "media", "read");
  if (!canRead) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Media</h1>
        <p className="mt-2 text-zinc-600">You don’t have permission to view media.</p>
      </div>
    );
  }

  const mediaList = await sql`
    SELECT id, path, filename, mime_type, created_at FROM media ORDER BY id DESC
  `;

  const canCreate = hasPermission(session.permissions, "media", "create");
  const canUpdate = hasPermission(session.permissions, "media", "update");
  const canDelete = hasPermission(session.permissions, "media", "delete");

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800">Media</h1>
      <p className="mt-1 text-zinc-600">Upload and manage images and files. Use them in events and pages.</p>
      <MediaList
        media={mediaList as { id: number; path: string; filename: string | null; mime_type: string | null; created_at: string }[]}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
