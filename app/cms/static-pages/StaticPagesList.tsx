"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StaticPageRow {
  id: number;
  slug: string;
  title: string | null;
  full_html: string;
  created_at: string;
  updated_at: string;
}

interface StaticPagesListProps {
  pages: StaticPageRow[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StaticPagesList({
  pages: initialPages,
  canCreate,
  canUpdate,
  canDelete,
}: StaticPagesListProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<StaticPageRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: "",
    title: "",
    full_html: "",
  });

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ slug: "", title: "", full_html: "" });
    setError("");
  };

  const openEdit = (p: StaticPageRow) => {
    setEditing(p);
    setCreating(false);
    setForm({
      slug: p.slug,
      title: p.title ?? "",
      full_html: p.full_html,
    });
    setError("");
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setError("");
  };

  const save = async () => {
    setError("");
    if (!form.slug.trim()) {
      setError("Slug is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim() || null,
        full_html: form.full_html,
      };

      if (editing) {
        const res = await fetch(`/api/cms/static-pages/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Update failed");
        }
      } else {
        const res = await fetch("/api/cms/static-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Create failed");
        }
      }

      closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: number) => {
    if (!confirm("Delete this static page? This cannot be undone.")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/cms/static-pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const showForm = creating || editing;

  return (
    <div className="mt-6">
      {canCreate && (
        <button
          type="button"
          onClick={openCreate}
          className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Add static page
        </button>
      )}

      {showForm && (
        <div className="mb-8 rounded-xl border border-secondary-dark bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">
            {editing ? "Edit static page" : "New static page"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g. about, support"
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Title (optional)</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Page title"
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-zinc-700">Full HTML (head + body)</label>
            <textarea
              value={form.full_html}
              onChange={(e) => setForm((f) => ({ ...f, full_html: e.target.value }))}
              rows={16}
              placeholder="Paste or type full HTML..."
              className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 font-mono text-sm text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-secondary-dark px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-secondary/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-secondary-dark bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-secondary-dark bg-secondary/30">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-800">Slug</th>
              <th className="px-4 py-3 font-semibold text-zinc-800">Title</th>
              <th className="px-4 py-3 font-semibold text-zinc-800">Updated</th>
              {(canUpdate || canDelete) && (
                <th className="px-4 py-3 font-semibold text-zinc-800">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {initialPages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No static pages yet. {canCreate && "Click “Add static page” to create one."}
                </td>
              </tr>
            ) : (
              initialPages.map((p) => (
                <tr key={p.id} className="border-b border-secondary-dark/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-800">{p.slug}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.title ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(p.updated_at)}</td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canUpdate && (
                          <button type="button" onClick={() => openEdit(p)} className="text-primary hover:underline">
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" onClick={() => deletePage(p.id)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
