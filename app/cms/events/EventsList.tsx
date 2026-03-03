"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventRow {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_id: number | null;
  created_at: string;
  updated_at: string;
}

interface MediaRow {
  id: number;
  path: string;
  filename: string | null;
}

interface EventsListProps {
  events: EventRow[];
  media: MediaRow[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventsList({
  events,
  media,
  canCreate,
  canUpdate,
  canDelete,
}: EventsListProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image_id: "" as string | number,
  });

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 16),
      location: "",
      image_id: "",
    });
    setError("");
  };

  const toDatetimeLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openEdit = (e: EventRow) => {
    setEditing(e);
    setCreating(false);
    setForm({
      title: e.title,
      description: e.description ?? "",
      date: toDatetimeLocal(e.date),
      location: e.location ?? "",
      image_id: e.image_id ?? "",
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
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        date: new Date(form.date).toISOString(),
        location: form.location.trim() || null,
        image_id: form.image_id ? Number(form.image_id) : null,
      };
      if (editing) {
        const res = await fetch(`/api/cms/events/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Update failed");
        }
      } else {
        const res = await fetch("/api/cms/events", {
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

  const deleteEvent = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/cms/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          Add event
        </button>
      )}

      {showForm && (
        <div className="mb-8 rounded-xl border border-secondary-dark bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">
            {editing ? "Edit event" : "New event"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Event title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Event description"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Date & time *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Online"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700">Image</label>
              <select
                value={form.image_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_id: e.target.value ? Number(e.target.value) : "" }))
                }
                className="w-full rounded-lg border border-secondary-dark bg-secondary/20 px-3 py-2 text-zinc-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">No image</option>
                {media.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.filename || m.path || `Media #${m.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || !form.title.trim() || !form.date}
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
              <th className="px-4 py-3 font-semibold text-zinc-800">Title</th>
              <th className="px-4 py-3 font-semibold text-zinc-800">Date</th>
              <th className="px-4 py-3 font-semibold text-zinc-800">Location</th>
              <th className="px-4 py-3 font-semibold text-zinc-800">Updated</th>
              {(canUpdate || canDelete) && (
                <th className="px-4 py-3 font-semibold text-zinc-800">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No events yet. {canCreate && "Click “Add event” to create one."}
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b border-secondary-dark/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-800">{e.title}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-zinc-600">{e.location ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(e.updated_at)}</td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => openEdit(e)}
                            className="text-primary hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteEvent(e.id)}
                            className="text-red-600 hover:underline"
                          >
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
