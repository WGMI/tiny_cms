"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface MediaRow {
  id: number;
  path: string;
  filename: string | null;
  mime_type: string | null;
  created_at: string;
}

interface MediaListProps {
  media: MediaRow[];
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

function isImage(mime: string | null): boolean {
  if (!mime) return false;
  return mime.startsWith("image/");
}

export function MediaList({
  media: initialMedia,
  canCreate,
  canUpdate,
  canDelete,
}: MediaListProps) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFilename, setEditFilename] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="file"]') as HTMLInputElement;
    if (!input?.files?.length) {
      setError("Choose a file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", input.files[0]);
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      const item = await res.json();
      setMedia((prev) => [item, ...prev]);
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this file? It will be removed from the library. Events using it will have no image.")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(m: MediaRow) {
    setEditingId(m.id);
    setEditFilename(m.filename || "");
  }

  async function saveEdit() {
    if (editingId === null) return;
    setError("");
    try {
      const res = await fetch(`/api/cms/media/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: editFilename }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Update failed");
      }
      const updated = await res.json();
      setMedia((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="mt-6">
      {canCreate && (
        <form onSubmit={handleUpload} className="mb-6 rounded-xl border border-secondary-dark bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-800">Upload file</h2>
          <p className="mb-3 text-xs text-zinc-500">Images (JPEG, PNG, GIF, WebP, SVG) or PDF. Max 10MB.</p>
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,image/*,application/pdf"
              className="text-sm text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-white file:hover:bg-primary-hover"
            />
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {media.length === 0 ? (
          <div className="col-span-full rounded-xl border border-secondary-dark bg-secondary/20 py-12 text-center text-zinc-500">
            No media yet. {canCreate && "Upload a file above."}
          </div>
        ) : (
          media.map((m) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-xl border border-secondary-dark bg-white shadow-sm"
            >
              <div className="flex aspect-video items-center justify-center bg-secondary/30 p-2">
                {isImage(m.mime_type) ? (
                  <img
                    src={m.path}
                    alt={m.filename || "Media"}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-4xl text-zinc-400">📄</span>
                )}
              </div>
              <div className="p-3">
                {editingId === m.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={editFilename}
                      onChange={(e) => setEditFilename(e.target.value)}
                      className="rounded border border-secondary-dark px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="text-sm text-primary hover:underline"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-sm text-zinc-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="truncate text-sm font-medium text-zinc-800" title={m.filename || m.path}>
                    {m.filename || m.path}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-zinc-500">{formatDate(m.created_at)}</p>
                <p className="mt-1 text-xs text-zinc-400">ID: {m.id}</p>
                <div className="mt-2 flex gap-2">
                  {canUpdate && editingId !== m.id && (
                    <button type="button" onClick={() => startEdit(m)} className="text-xs text-primary hover:underline">
                      Edit name
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === m.id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
