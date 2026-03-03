import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { hasPermission } from "@/lib/auth/permissions";
import { sql } from "@/lib/db";
import { EventsList } from "./EventsList";

export default async function EventsPage() {
  const session = await getSession();
  if (!session) redirect("/cms/login");

  const canRead = hasPermission(session.permissions, "events", "read");
  if (!canRead) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Events</h1>
        <p className="mt-2 text-zinc-600">You don’t have permission to view events.</p>
      </div>
    );
  }

  const events = await sql`
    SELECT e.id, e.title, e.description, e.date, e.location, e.image_id, e.created_at, e.updated_at
    FROM events e
    ORDER BY e.date DESC
  `;
  const mediaList = await sql`SELECT id, path, filename FROM media ORDER BY id`;

  const canCreate = hasPermission(session.permissions, "events", "create");
  const canUpdate = hasPermission(session.permissions, "events", "update");
  const canDelete = hasPermission(session.permissions, "events", "delete");

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800">Events</h1>
      <p className="mt-1 text-zinc-600">Manage events for the public events page.</p>
      <EventsList
        events={events as { id: number; title: string; description: string | null; date: string; location: string | null; image_id: number | null; created_at: string; updated_at: string }[]}
        media={mediaList as { id: number; path: string; filename: string | null }[]}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
