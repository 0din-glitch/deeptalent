"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Youtube,
  Twitter,
  Instagram,
  Music2,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  FileText,
  Activity,
  ExternalLink,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type PlatformKey = "youtube" | "twitter" | "instagram" | "tiktok";

type Account = {
  id: string;
  platform: PlatformKey;
  handle: string;
  url: string | null;
  label: string | null;
  followers: number | null;
  following: number | null;
  posts: number | null;
  engagement_rate: number | null;
  extra: Record<string, unknown> | null;
  last_synced_at: string | null;
  last_error: string | null;
};

type PlatformInfo = { key: PlatformKey; label: string; ready: boolean; configured: boolean };

const PLATFORM_META: Record<PlatformKey, { icon: typeof Youtube; color: string; bg: string }> = {
  youtube: { icon: Youtube, color: "text-red-600", bg: "bg-red-50" },
  twitter: { icon: Twitter, color: "text-sky-500", bg: "bg-sky-50" },
  instagram: { icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
  tiktok: { icon: Music2, color: "text-gray-900", bg: "bg-gray-100" },
};

function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SocialTab() {
  const { data } = useSWR<{ accounts: Account[]; platforms: PlatformInfo[] }>("/api/admin/social", fetcher);
  const [showAdd, setShowAdd] = useState(false);

  const accounts = data?.accounts || [];
  const platforms = data?.platforms || [];

  return (
    <div className="space-y-6">
      {/* Platform status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platforms.map((p) => {
          const meta = PLATFORM_META[p.key];
          const Icon = meta.icon;
          return (
            <div key={p.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className={`size-9 rounded-lg grid place-items-center ${meta.bg}`}>
                <Icon className={`size-5 ${meta.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.label}</p>
                <p className={`text-[11px] font-medium ${p.configured ? "text-emerald-600" : "text-gray-400"}`}>
                  {p.configured ? "API connected" : "Needs API key"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Social watchlist</h3>
          <p className="text-sm text-gray-500">Track follower growth and engagement across platforms.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
        >
          <Plus className="size-4" /> Add account
        </button>
      </div>

      {/* Accounts */}
      {!data ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <Activity className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">No accounts tracked yet</p>
          <p className="text-xs text-gray-400 mt-1">Add a username or link to start monitoring analytics.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      )}

      {showAdd && <AddAccountModal platforms={platforms} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AccountCard({ account }: { account: Account }) {
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const meta = PLATFORM_META[account.platform];
  const Icon = meta.icon;

  async function refresh() {
    setRefreshing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/social/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id }),
      });
      const json = await res.json();
      if (!json.ok) setNotice(json.reason || "Could not fetch metrics.");
      mutate("/api/admin/social");
    } finally {
      setRefreshing(false);
    }
  }

  async function remove() {
    await fetch(`/api/admin/social?id=${account.id}`, { method: "DELETE" });
    mutate("/api/admin/social");
  }

  return (
    <div className="p-4 rounded-2xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`size-10 rounded-xl grid place-items-center ${meta.bg}`}>
            <Icon className={`size-5 ${meta.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{account.label || account.handle}</p>
            <p className="text-xs text-gray-500 truncate">@{account.handle.replace(/^@/, "")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {account.url && (
            <a href={account.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-[#3B5BDB] hover:bg-gray-50" title="Open profile">
              <ExternalLink className="size-4" />
            </a>
          )}
          <button onClick={refresh} disabled={refreshing} className="p-1.5 rounded-lg text-gray-400 hover:text-[#3B5BDB] hover:bg-gray-50" title="Refresh metrics">
            {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          </button>
          <button onClick={remove} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-50" title="Remove">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Metric icon={Users} label="Followers" value={fmt(account.followers)} />
        <Metric icon={FileText} label="Posts" value={fmt(account.posts)} />
        <Metric icon={Activity} label="Engage" value={account.engagement_rate != null ? `${account.engagement_rate}%` : "—"} />
      </div>

      {notice ? (
        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" /> {notice}
        </div>
      ) : account.last_synced_at ? (
        <p className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
          <CheckCircle2 className="size-3 text-emerald-500" />
          Updated {new Date(account.last_synced_at).toLocaleString()}
        </p>
      ) : (
        <p className="mt-3 text-[11px] text-gray-400">Not synced yet — hit refresh to pull metrics.</p>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-2.5 text-center">
      <Icon className="size-3.5 text-gray-400 mx-auto mb-1" />
      <p className="text-sm font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}

function AddAccountModal({ platforms, onClose }: { platforms: PlatformInfo[]; onClose: () => void }) {
  const [platform, setPlatform] = useState<PlatformKey>("youtube");
  const [handle, setHandle] = useState("");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!handle.trim()) {
      setError("Enter a username or link.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, url, label }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add.");
        return;
      }
      mutate("/api/admin/social");
      // auto-refresh the newly added account
      if (json.id) {
        fetch("/api/admin/social/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: json.id }),
        }).then(() => mutate("/api/admin/social"));
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const selected = platforms.find((p) => p.key === platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Add account to watchlist</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {platforms.map((p) => {
                const meta = PLATFORM_META[p.key];
                const Icon = meta.icon;
                const active = platform === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPlatform(p.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      active ? "border-[#3B5BDB] bg-[#3B5BDB]/[0.04]" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <Icon className={`size-5 ${meta.color}`} />
                    <span className="text-[10px] font-medium text-gray-600">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selected && !selected.configured && (
            <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              {selected.label} analytics needs its API key before metrics will load. You can still add it to the watchlist now.
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Username / handle or channel ID</label>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} className="form-input" placeholder="@deeptalent" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Profile link (optional)</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="form-input" placeholder="https://youtube.com/@deeptalent" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Label (optional)</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="form-input" placeholder="Main brand channel" />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add to watchlist
        </button>
      </div>
    </div>
  );
}
