"use client";

import { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  X,
  Save,
  Calendar,
  Tag,
  Image as ImageIcon,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useAdminMe } from "./use-admin-me";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  read_time_minutes: number | null;
  published_at: string | null;
  author_name: string | null;
  author_email: string | null;
  updated_at: string | null;
  created_at: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_TONE: Record<Post["status"], string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-orange-50 text-orange-700",
};

const CATEGORIES = [
  "Technology",
  "Strategy",
  "Compliance",
  "Operations",
  "Finance",
  "Talent",
  "Product",
];

export function ContentTab() {
  const { me } = useAdminMe();
  const isSuper = !!me?.is_super_admin;

  const [statusFilter, setStatusFilter] = useState<"all" | Post["status"]>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Post | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Post | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    return `/api/admin/blog${qs ? `?${qs}` : ""}`;
  }, [statusFilter, query]);

  const { data, isLoading, mutate } = useSWR<{ posts: Post[] }>(url, fetcher);
  const posts = data?.posts ?? [];

  async function handleDelete(post: Post) {
    setDeletingId(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error || "Delete failed");
        return;
      }
      setConfirmDelete(null);
      await mutate();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200/70 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Content & Blog</h2>
            <p className="text-sm text-gray-600 mt-1">
              Author articles for the public Insights feed. Drafts are private; published posts
              appear on <span className="font-medium">/insights</span> and the homepage.
            </p>
          </div>
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] transition-colors"
          >
            <Plus className="size-4" /> New post
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start">
            {(["all", "published", "draft", "archived"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 h-8 rounded-md text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => mutate()}
            className="h-10 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            {isLoading ? "Loading…" : "No posts match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Published</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 line-clamp-1">{p.title}</span>
                        <span className="text-xs text-gray-500">/{p.slug}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{p.category || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_TONE[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {p.status === "published" && (
                          <a
                            href={`/insights/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View live"
                            className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye className="size-3.5" />
                          </a>
                        )}
                        <button
                          title="Edit"
                          onClick={() => setEditing(p)}
                          className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#3B5BDB]/10 hover:text-[#3B5BDB]"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          title={isSuper ? "Delete post" : "Only super admins can delete posts"}
                          disabled={!isSuper}
                          onClick={() => setConfirmDelete(p)}
                          className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <PostEditor
          post={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await mutate();
            await globalMutate("/api/admin/audit?limit=50");
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => (deletingId ? null : setConfirmDelete(null))} className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Delete this post?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This permanently removes &ldquo;
                  <span className="font-medium text-gray-900">{confirmDelete.title}</span>&rdquo;
                  from the database. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={!!deletingId}
                className="h-9 px-4 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 inline-flex items-center gap-1.5"
              >
                {deletingId ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                {deletingId ? "Deleting…" : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function PostEditor({
  post,
  onClose,
  onSaved,
}: {
  post: Post | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const isNew = !post;
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    category: post?.category || "Technology",
    cover_image_url: post?.cover_image_url || "",
    read_time_minutes: post?.read_time_minutes ?? 5,
    content: post?.content || "",
    status: (post?.status as Post["status"]) || "draft",
    published_at: post?.published_at ? post.published_at.slice(0, 16) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(nextStatus?: Post["status"]) {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, any> = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        category: form.category,
        cover_image_url: form.cover_image_url,
        read_time_minutes: Number(form.read_time_minutes) || null,
        content: form.content,
        status: nextStatus || form.status,
      };
      if (form.published_at) body.published_at = new Date(form.published_at).toISOString();

      const res = await fetch(isNew ? "/api/admin/blog" : `/api/admin/blog/${post!.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Save failed");
        return;
      }
      if (nextStatus === "published" || form.status === "published") {
        await onSaved();
      } else {
        setSavedAt(Date.now());
        await onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative ml-auto h-full w-full max-w-3xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/60">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3B5BDB]">
              {isNew ? "New post" : "Edit post"}
            </p>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mt-0.5">
              {form.title || "Untitled draft"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200/60"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
          {savedAt && !error && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs px-3 py-2 inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Saved
            </div>
          )}

          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Make it punchy"
              className="w-full h-11 px-3 rounded-lg border border-gray-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Slug" hint="URL: /insights/<slug>">
              <input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder={isNew ? "auto-generated from title" : ""}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              />
            </Field>

            <Field label="Category" icon={<Tag className="size-3.5" />}>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Excerpt" hint="Shown on the cards. ~1–2 sentences.">
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={2}
              className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Cover image URL" icon={<ImageIcon className="size-3.5" />}>
              <input
                value={form.cover_image_url}
                onChange={(e) => update("cover_image_url", e.target.value)}
                placeholder="https://…"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              />
            </Field>
            <Field label="Read time (min)">
              <input
                type="number"
                min={1}
                max={60}
                value={form.read_time_minutes}
                onChange={(e) => update("read_time_minutes", Number(e.target.value) as any)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              />
            </Field>
            <Field label="Publish date" icon={<Calendar className="size-3.5" />}>
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => update("published_at", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              />
            </Field>
          </div>

          <Field label="Content" hint="Markdown supported (## headings, **bold**, lists, links).">
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              rows={18}
              className="w-full p-4 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              placeholder={"## Section\n\nWrite your post body here…"}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_TONE[form.status]}`}>
              {form.status}
            </span>
            {form.status === "published" && form.slug && !isNew && (
              <a
                href={`/insights/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#3B5BDB] inline-flex items-center gap-1 hover:underline"
              >
                View live <ArrowUpRight className="size-3" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => save("draft")}
              disabled={saving || !form.title.trim()}
              className="h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save draft
            </button>
            <button
              onClick={() => save("published")}
              disabled={saving || !form.title.trim()}
              className="h-9 px-4 rounded-lg text-sm font-semibold bg-[#3B5BDB] text-white hover:bg-[#2d42a6] disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        {icon}
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}
