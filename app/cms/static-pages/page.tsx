import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { hasPermission } from "@/lib/auth/permissions";
import { sql } from "@/lib/db";
import { StaticPagesList } from "./StaticPagesList";

export default async function CmsStaticPagesPage() {
  const session = await getSession();
  if (!session) redirect("/cms/login");

  const canRead = hasPermission(session.permissions, "static_pages", "read");
  if (!canRead) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Static Pages</h1>
        <p className="mt-2 text-zinc-600">You don&apos;t have permission to view static pages.</p>
      </div>
    );
  }

  const pagesList = await sql`
    SELECT id, slug, title, full_html, created_at, updated_at
    FROM static_pages
    ORDER BY slug
  `;

  const canCreate = hasPermission(session.permissions, "static_pages", "create");
  const canUpdate = hasPermission(session.permissions, "static_pages", "update");
  const canDelete = hasPermission(session.permissions, "static_pages", "delete");

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800">Static Pages</h1>
      <p className="mt-1 text-zinc-600">
        Manage raw HTML static pages. Consumer loads by slug.
      </p>
      <StaticPagesList
        pages={pagesList as { id: number; slug: string; title: string | null; full_html: string; created_at: string; updated_at: string }[]}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
