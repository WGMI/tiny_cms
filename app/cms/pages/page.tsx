import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { hasPermission } from "@/lib/auth/permissions";
import { sql } from "@/lib/db";
import { PagesList } from "./PagesList";

export default async function CmsPagesPage() {
  const session = await getSession();
  if (!session) redirect("/cms/login");

  const canRead = hasPermission(session.permissions, "pages", "read");
  if (!canRead) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Pages</h1>
        <p className="mt-2 text-zinc-600">You don’t have permission to view pages.</p>
      </div>
    );
  }

  const pagesList = await sql`
    SELECT id, slug, title, full_html, sections, created_at, updated_at
    FROM pages
    ORDER BY slug
  `;
  const mediaList = await sql`SELECT id, path, filename FROM media ORDER BY id DESC`;

  const canCreate = hasPermission(session.permissions, "pages", "create");
  const canUpdate = hasPermission(session.permissions, "pages", "update");
  const canDelete = hasPermission(session.permissions, "pages", "delete");

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800">Pages</h1>
      <p className="mt-1 text-zinc-600">
        Manage site pages. Use sections (with images from media) or paste raw HTML. Consumer loads by slug (e.g. /about.html → slug &quot;about&quot;).
      </p>
      <PagesList
        pages={pagesList as { id: number; slug: string; title: string | null; full_html: string; sections: unknown; created_at: string; updated_at: string }[]}
        media={mediaList as { id: number; path: string; filename: string | null }[]}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
