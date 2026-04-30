"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Section } from "@/lib/pages/types";

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
  media: MediaRow[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface MediaRow {
  id: number;
  path: string;
  filename: string | null;
}

const SECTION_TYPES = [
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "image", label: "Image" },
  { value: "columns2", label: "Two columns" },
  { value: "columns3", label: "Three columns" },
  { value: "html", label: "Raw HTML" },
] as const;

type SectionTypeOption = Section["type"] | "columns2" | "columns3";

function createEmptySection(type: SectionTypeOption): Section {
  if (type === "heading") return { type: "heading", level: 2, text: "" };
  if (type === "paragraph") return { type: "paragraph", content: "" };
  if (type === "image") return { type: "image", media_id: 0, alt: "", caption: "" };
  if (type === "columns2") return { type: "columns", columns: ["", ""] };
  if (type === "columns3") return { type: "columns", columns: ["", "", ""] };
  return { type: "html", content: "" };
}

function parseSections(fullHtml: string): Section[] {
  if (!fullHtml.trim()) return [];
  try {
    const parsed = JSON.parse(fullHtml) as unknown;
    return Array.isArray(parsed) ? (parsed as Section[]) : [];
  } catch {
    return [];
  }
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
  media,
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
    sections: [] as Section[],
  });

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ slug: "", title: "", sections: [] });
    setError("");
  };

  const openEdit = (p: StaticPageRow) => {
    setEditing(p);
    setCreating(false);
    setForm({
      slug: p.slug,
      title: p.title ?? "",
      sections: parseSections(p.full_html),
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
        sections: form.sections,
      };
      if (payload.sections.length === 0) {
        setError("Add at least one section");
        setSaving(false);
        return;
      }

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
  const addSection = (type: SectionTypeOption) => {
    setForm((f) => ({ ...f, sections: [...f.sections, createEmptySection(type)] }));
  };
  const removeSection = (index: number) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.filter((_, i) => i !== index),
    }));
  };
  const updateSection = (index: number, section: Section) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => (i === index ? section : s)),
    }));
  };
  const moveSection = (index: number, dir: "up" | "down") => {
    const newSections = [...form.sections];
    const j = dir === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= newSections.length) return;
    [newSections[index], newSections[j]] = [newSections[j], newSections[index]];
    setForm((f) => ({ ...f, sections: newSections }));
  };

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
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Sections</span>
              <div className="flex flex-wrap gap-1">
                {SECTION_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => addSection(value)}
                    className="rounded border border-primary/50 bg-primary-light px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {form.sections.map((section, index) => (
                <SectionEditor
                  key={index}
                  section={section}
                  media={media}
                  onChange={(s) => updateSection(index, s)}
                  onRemove={() => removeSection(index)}
                  onMoveUp={index > 0 ? () => moveSection(index, "up") : undefined}
                  onMoveDown={index < form.sections.length - 1 ? () => moveSection(index, "down") : undefined}
                />
              ))}
              {form.sections.length === 0 && (
                <p className="rounded-lg border border-dashed border-secondary-dark bg-secondary/20 py-6 text-center text-sm text-zinc-500">
                  Click a section type above to add content.
                </p>
              )}
            </div>
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

function SectionEditor({
  section,
  media,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: Section;
  media: MediaRow[];
  onChange: (s: Section) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <div className="rounded-lg border border-secondary-dark bg-secondary/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-zinc-500">{section.type}</span>
        <div className="flex gap-1">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-secondary-dark">
              ↑
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-secondary-dark">
              ↓
            </button>
          )}
          <button type="button" onClick={onRemove} className="rounded px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50">
            Remove
          </button>
        </div>
      </div>
      {section.type === "heading" && (
        <div className="space-y-2">
          <select
            value={section.level}
            onChange={(e) => onChange({ ...section, level: Number(e.target.value) as 1 | 2 | 3 })}
            className="rounded border border-secondary-dark bg-white px-2 py-1 text-sm"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            value={section.text}
            onChange={(e) => onChange({ ...section, text: e.target.value })}
            placeholder="Heading text"
            className="w-full rounded border border-secondary-dark bg-white px-3 py-2 text-sm"
          />
        </div>
      )}
      {section.type === "paragraph" && (
        <textarea
          value={section.content}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          placeholder="Paragraph (HTML allowed)"
          rows={3}
          className="w-full rounded border border-secondary-dark bg-white px-3 py-2 text-sm"
        />
      )}
      {section.type === "image" && (
        <div className="space-y-2">
          <select
            value={section.media_id || ""}
            onChange={(e) => onChange({ ...section, media_id: Number(e.target.value) || 0 })}
            className="w-full rounded border border-secondary-dark bg-white px-3 py-2 text-sm"
          >
            <option value="">Select image</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.filename || m.path || `Media #${m.id}`}
              </option>
            ))}
          </select>
          <input
            value={section.alt ?? ""}
            onChange={(e) => onChange({ ...section, alt: e.target.value })}
            placeholder="Alt text"
            className="w-full rounded border border-secondary-dark bg-white px-3 py-2 text-sm"
          />
          <input
            value={section.caption ?? ""}
            onChange={(e) => onChange({ ...section, caption: e.target.value })}
            placeholder="Caption (optional)"
            className="w-full rounded border border-secondary-dark bg-white px-3 py-2 text-sm"
          />
        </div>
      )}
      {section.type === "columns" && (
        <div className={`grid gap-2 ${section.columns.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {section.columns.map((col, i) => (
            <textarea
              key={i}
              value={col}
              onChange={(e) => {
                const next = [...section.columns];
                next[i] = e.target.value;
                onChange({ ...section, columns: next as [string, string] | [string, string, string] });
              }}
              placeholder={`Column ${i + 1} (HTML allowed)`}
              rows={3}
              className="rounded border border-secondary-dark bg-white px-3 py-2 text-sm"
            />
          ))}
        </div>
      )}
      {section.type === "html" && (
        <textarea
          value={section.content}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          placeholder="Raw HTML block"
          rows={4}
          className="w-full rounded border border-secondary-dark bg-white font-mono text-sm"
        />
      )}
    </div>
  );
}
