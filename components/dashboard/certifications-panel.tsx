"use client";

import { useState, useTransition } from "react";
import { Award, Download, ExternalLink, Plus, Trash2 } from "lucide-react";

type Cert = {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  notes: string | null;
  created_at: string;
};

type Result = { ok: boolean; error?: string };

export function CertificationsPanel({
  certifications,
  addAction,
  deleteAction,
  signUrlAction,
}: {
  certifications: Cert[];
  addAction: (fd: FormData) => Promise<Result>;
  deleteAction: (fd: FormData) => Promise<Result>;
  signUrlAction: (path: string) => Promise<{ ok: boolean; url?: string; error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await addAction(fd);
      if (!res.ok) setError(res.error || "Could not save certification.");
      else {
        form.reset();
        setOpen(false);
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this certification?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const res = await deleteAction(fd);
      if (!res.ok) setError(res.error || "Delete failed.");
    });
  }

  async function onDownload(filePath: string) {
    const res = await signUrlAction(filePath);
    if (!res.ok || !res.url) {
      setError(res.error || "Could not generate link.");
      return;
    }
    window.open(res.url, "_blank", "noopener");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-gray-900">Certifications & licenses</h3>
            <p className="text-sm text-gray-500 mt-1">Add credentials to strengthen your profile. Upload proof for verification.</p>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            <Plus className="size-4" />
            {open ? "Cancel" : "Add certification"}
          </button>
        </div>

        {open && (
          <form onSubmit={onAdd} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Certification name" name="name" required />
            <Field label="Issuing organization" name="issuer" />
            <Field label="Issue date" name="issue_date" type="date" />
            <Field label="Expiry date" name="expiry_date" type="date" />
            <Field label="Credential ID" name="credential_id" />
            <Field label="Credential URL" name="credential_url" type="url" />
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Proof file (optional)</span>
              <input
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#3B5BDB]/10 file:text-[#3B5BDB] file:font-medium file:px-3 file:py-2 file:hover:bg-[#3B5BDB]/15"
              />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Notes</span>
              <textarea
                name="notes"
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] outline-none"
              />
            </label>
            <div className="md:col-span-2 flex items-center justify-between">
              {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
              <button
                type="submit"
                disabled={isPending}
                className="h-10 px-5 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save certification"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {certifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No certifications yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {certifications.map((c) => (
              <li key={c.id} className="p-5 flex items-start gap-4 flex-wrap">
                <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.issuer || "—"}
                    {c.issue_date ? ` • Issued ${new Date(c.issue_date).toLocaleDateString()}` : ""}
                    {c.expiry_date ? ` • Expires ${new Date(c.expiry_date).toLocaleDateString()}` : ""}
                  </p>
                  {(c.credential_id || c.credential_url) && (
                    <div className="flex items-center gap-3 flex-wrap mt-2 text-xs">
                      {c.credential_id && <span className="text-gray-600">ID: <span className="font-mono">{c.credential_id}</span></span>}
                      {c.credential_url && (
                        <a
                          href={c.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#3B5BDB] hover:underline"
                        >
                          Verify <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  )}
                  {c.notes && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{c.notes}</p>}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {c.file_path && (
                    <button
                      onClick={() => onDownload(c.file_path!)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      <Download className="size-3.5" /> Proof
                    </button>
                  )}
                  {!c.file_path && c.external_url && (
                    <a
                      href={c.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      <Download className="size-3.5" /> Proof
                    </a>
                  )}
                  <button
                    onClick={() => onDelete(c.id)}
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

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-10 rounded-xl border border-gray-200 px-3.5 text-sm focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] outline-none"
      />
    </label>
  );
}
