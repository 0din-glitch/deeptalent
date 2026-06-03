"use client";

import { useState, useTransition } from "react";
import { Star, Trash2, Upload, Download, FileText } from "lucide-react";

type Resume = {
  id: string;
  title: string;
  file_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_primary: boolean;
  notes: string | null;
  external_url: string | null;
  created_at: string;
};

type Result = { ok: boolean; error?: string };

export function ResumesPanel({
  resumes,
  uploadAction,
  deleteAction,
  setPrimaryAction,
  signUrlAction,
}: {
  resumes: Resume[];
  uploadAction: (fd: FormData) => Promise<Result>;
  deleteAction: (fd: FormData) => Promise<Result>;
  setPrimaryAction: (fd: FormData) => Promise<Result>;
  signUrlAction: (path: string) => Promise<{ ok: boolean; url?: string; error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await uploadAction(fd);
      if (!res.ok) setError(res.error || "Upload failed.");
      else form.reset();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const res = await deleteAction(fd);
      if (!res.ok) setError(res.error || "Delete failed.");
    });
  }

  function onSetPrimary(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const res = await setPrimaryAction(fd);
      if (!res.ok) setError(res.error || "Could not set primary.");
    });
  }

  async function onDownload(filePath: string) {
    setError(null);
    const res = await signUrlAction(filePath);
    if (!res.ok || !res.url) {
      setError(res.error || "Could not get download link.");
      return;
    }
    window.open(res.url, "_blank", "noopener");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">Upload a resume</h3>
          <p className="text-sm text-gray-500 mt-1">PDF, DOCX, or other documents up to 15 MB. Add multiple versions tailored to different roles.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input
              name="title"
              required
              placeholder="e.g. Senior Engineer Resume"
              className="h-10 rounded-xl border border-gray-200 px-3.5 text-sm focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">File</span>
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt,application/pdf"
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#3B5BDB]/10 file:text-[#3B5BDB] file:font-medium file:px-3 file:py-2 file:hover:bg-[#3B5BDB]/15"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Notes (optional)</span>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] outline-none"
            placeholder="What is this version tailored for?"
          />
        </label>
        <div className="flex items-center justify-between">
          {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
          >
            <Upload className="size-4" />
            {isPending ? "Uploading..." : "Upload resume"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {resumes.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No resumes yet. Upload your first version above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {resumes.map((r) => (
              <li key={r.id} className="p-5 flex items-start gap-4 flex-wrap">
                <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                    {r.is_primary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        <Star className="size-3 fill-emerald-700" /> Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {r.file_name || "—"}
                    {r.file_size_bytes ? ` • ${formatBytes(r.file_size_bytes)}` : ""} • Uploaded {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.notes && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {r.file_path && (
                    <button
                      onClick={() => onDownload(r.file_path!)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      <Download className="size-3.5" /> Download
                    </button>
                  )}
                  {!r.file_path && r.external_url && (
                    <a
                      href={r.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      <Download className="size-3.5" /> Download
                    </a>
                  )}
                  {!r.is_primary && (
                    <button
                      onClick={() => onSetPrimary(r.id)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      <Star className="size-3.5" /> Set primary
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(r.id)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
