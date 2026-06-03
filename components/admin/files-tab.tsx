"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  User,
} from "lucide-react";

type LegacyFile = {
  id: string;
  bucket: "avatars" | "verification";
  storage_path: string;
  legacy_user_ref: string | null;
  file_name: string;
  size_bytes: number | null;
  content_type: string | null;
  migrated_at: string;
};

type Group = {
  userRef: string;
  avatar: LegacyFile | null;
  verification: LegacyFile[];
  total: number;
  totalBytes: number;
};

function formatBytes(b: number | null | undefined) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function prettifyName(name: string) {
  // Strip leading timestamp-style numbers and replace dashes with spaces
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function FilesTab({ initialFiles }: { initialFiles: LegacyFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [running, startTransition] = useTransition();
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  const supabase = createClient();

  async function refresh() {
    startTransition(async () => {
      const { data } = await supabase
        .from("legacy_files")
        .select("*")
        .order("legacy_user_ref", { ascending: true })
        .order("file_name", { ascending: true });
      if (data) setFiles(data as LegacyFile[]);
    });
  }

  async function runMigration() {
    setMigrating(true);
    setMigrationResult(null);
    try {
      const res = await fetch("/api/admin/migrate-tigris", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setMigrationResult(`Error: ${json.error ?? "failed"}`);
      } else {
        setMigrationResult(
          `${json.migrated} new file(s) imported. ${json.skipped} already up to date${
            json.errored ? `, ${json.errored} errored` : ""
          }.`
        );
        await refresh();
      }
    } catch (e: any) {
      setMigrationResult(`Error: ${e.message}`);
    } finally {
      setMigrating(false);
    }
  }

  async function openFile(file: LegacyFile) {
    if (file.bucket === "avatars") {
      const { data } = supabase.storage.from(file.bucket).getPublicUrl(file.storage_path);
      window.open(data.publicUrl, "_blank");
    } else {
      const { data, error } = await supabase.storage
        .from(file.bucket)
        .createSignedUrl(file.storage_path, 60 * 10);
      if (error) {
        alert(`Could not create signed URL: ${error.message}`);
        return;
      }
      window.open(data.signedUrl, "_blank");
    }
  }

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const f of files) {
      const key = f.legacy_user_ref ?? "unknown";
      let g = map.get(key);
      if (!g) {
        g = {
          userRef: key,
          avatar: null,
          verification: [],
          total: 0,
          totalBytes: 0,
        };
        map.set(key, g);
      }
      if (f.bucket === "avatars") {
        g.avatar = f;
      } else {
        g.verification.push(f);
      }
      g.total += 1;
      g.totalBytes += f.size_bytes ?? 0;
    }

    for (const g of map.values()) {
      g.verification.sort((a, b) => a.file_name.localeCompare(b.file_name));
    }

    const list = Array.from(map.values()).sort((a, b) =>
      a.userRef.localeCompare(b.userRef),
    );

    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((g) => {
      if (g.userRef.toLowerCase().includes(q)) return true;
      if (g.avatar?.file_name.toLowerCase().includes(q)) return true;
      return g.verification.some((v) => v.file_name.toLowerCase().includes(q));
    });
  }, [files, query]);

  const stats = useMemo(() => {
    return {
      users: new Set(files.map((f) => f.legacy_user_ref ?? "unknown")).size,
      avatars: files.filter((f) => f.bucket === "avatars").length,
      verification: files.filter((f) => f.bucket === "verification").length,
      totalBytes: files.reduce((sum, f) => sum + (f.size_bytes ?? 0), 0),
    };
  }, [files]);

  function toggle(userRef: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userRef)) next.delete(userRef);
      else next.add(userRef);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(groups.map((g) => g.userRef)));
  }
  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by user ID or file name"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expanded.size === groups.length ? collapseAll : expandAll}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            {expanded.size === groups.length ? "Collapse all" : "Expand all"}
          </button>
          <button
            onClick={refresh}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </button>
          <button
            onClick={runMigration}
            disabled={migrating}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#3B5BDB] text-white rounded-lg hover:bg-[#3148B5] disabled:opacity-50"
          >
            {migrating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {migrating ? "Importing…" : "Sync from Tigris"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Talent profiles" value={stats.users} />
        <Stat label="Profile photos" value={stats.avatars} />
        <Stat label="Verification docs" value={stats.verification} />
        <Stat label="Total storage" value={formatBytes(stats.totalBytes)} />
      </div>

      {migrationResult && (
        <div className="bg-blue-50 border border-blue-100 text-blue-900 text-sm px-4 py-3 rounded-xl">
          {migrationResult}
        </div>
      )}

      {/* Grouped list */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {groups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {files.length === 0
              ? `No files yet. Click "Sync from Tigris" to import existing files.`
              : "No matching files."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {groups.map((g) => {
              const isOpen = expanded.has(g.userRef);
              return (
                <li key={g.userRef}>
                  <button
                    onClick={() => toggle(g.userRef)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="text-gray-400 shrink-0">
                      {isOpen ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </div>

                    {g.avatar ? (
                      <AvatarThumb file={g.avatar} supabase={supabase} />
                    ) : (
                      <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <User className="size-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 font-mono text-sm truncate">
                        {g.userRef}
                      </p>
                      <p className="text-xs text-gray-500">
                        {g.total} file{g.total === 1 ? "" : "s"} · {formatBytes(g.totalBytes)}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center gap-2 shrink-0">
                      {g.avatar && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          <ImageIcon className="size-3" /> 1 photo
                        </span>
                      )}
                      {g.verification.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          <FileText className="size-3" /> {g.verification.length} doc
                          {g.verification.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 bg-gray-50/60 border-t border-gray-100">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="py-2 pr-4">File</th>
                            <th className="py-2 pr-4 hidden md:table-cell">Type</th>
                            <th className="py-2 pr-4">Size</th>
                            <th className="py-2 pr-4 hidden md:table-cell">Migrated</th>
                            <th className="py-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.avatar && (
                            <FileRow file={g.avatar} onOpen={openFile} />
                          )}
                          {g.verification.map((f) => (
                            <FileRow key={f.id} file={f} onOpen={openFile} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function FileRow({
  file,
  onOpen,
}: {
  file: LegacyFile;
  onOpen: (f: LegacyFile) => void;
}) {
  const Icon = file.bucket === "avatars" ? ImageIcon : FileText;
  return (
    <tr className="border-t border-gray-100">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
              file.bucket === "avatars"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[28rem]">
              {prettifyName(file.file_name)}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[28rem] font-mono">
              {file.file_name}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 hidden md:table-cell">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            file.bucket === "avatars"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {file.bucket === "avatars" ? "Profile photo" : "Verification"}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">
        {formatBytes(file.size_bytes)}
      </td>
      <td className="py-3 pr-4 hidden md:table-cell text-sm text-gray-500 whitespace-nowrap">
        {new Date(file.migrated_at).toLocaleDateString()}
      </td>
      <td className="py-3 text-right">
        <button
          onClick={() => onOpen(file)}
          className="text-sm font-medium text-[#3B5BDB] hover:underline"
        >
          Open
        </button>
      </td>
    </tr>
  );
}

function AvatarThumb({
  file,
  supabase,
}: {
  file: LegacyFile;
  supabase: ReturnType<typeof createClient>;
}) {
  const { data } = supabase.storage.from("avatars").getPublicUrl(file.storage_path);
  return (
    <div className="size-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.publicUrl}
        alt={file.file_name}
        className="size-full object-cover"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
