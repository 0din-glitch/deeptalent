"use client";

import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { useAdminMe } from "@/components/admin/use-admin-me";
import {
  Plus,
  X,
  Loader2,
  Flag,
  Calendar,
  Repeat,
  Trash2,
  CheckCircle2,
  Circle,
  CircleDot,
  Ban,
  User,
  AlertTriangle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "blocked" | "done";
  assigned_to: string | null;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  assigned_by: string | null;
  assigned_by_name: string | null;
  assigned_by_email: string | null;
  due_date: string | null;
  is_recurring: boolean;
  recurrence: string | null;
  progress_note: string | null;
  created_at: string;
};

type Member = { id: string; name: string; email: string; tier: string };

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

const STATUS_COLUMNS = [
  { key: "todo", label: "To Do", icon: Circle, color: "text-gray-400" },
  { key: "in_progress", label: "In Progress", icon: CircleDot, color: "text-blue-500" },
  { key: "blocked", label: "Blocked", icon: Ban, color: "text-red-500" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
] as const;

const TIER_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
};

export function TasksTab() {
  const { me } = useAdminMe();
  const isSuper = me?.is_super_admin === true;
  const [view, setView] = useState<"mine" | "team">("mine");
  const [assignOpen, setAssignOpen] = useState(false);

  const scope = isSuper && view === "team" ? "team" : "mine";
  const { data } = useSWR<{ tasks: Task[]; myId: string }>(`/api/admin/tasks?scope=${scope}`, fetcher, {
    refreshInterval: 30_000,
  });
  const tasks = data?.tasks ?? [];
  const myId = data?.myId;

  const stats = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const today = new Date().toISOString().slice(0, 10);
    const overdue = tasks.filter((t) => t.status !== "done" && t.due_date && t.due_date < today).length;
    return { open, inProgress, done, overdue };
  }, [tasks]);

  function refresh() {
    mutate(`/api/admin/tasks?scope=${scope}`);
  }

  return (
    <div>
      {assignOpen && <AssignModal onClose={() => setAssignOpen(false)} ondone={refresh} canPickAssignee={isSuper} me={me} />}

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100">
          <button
            onClick={() => setView("mine")}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === "mine" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Tasks
          </button>
          {isSuper && (
            <button
              onClick={() => setView("team")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === "team" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Team Board
            </button>
          )}
        </div>

        <button
          onClick={() => setAssignOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
        >
          <Plus className="size-4" /> {isSuper ? "Assign task" : "New task"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Open" value={stats.open} />
        <StatCard label="In progress" value={stats.inProgress} tone="blue" />
        <StatCard label="Completed" value={stats.done} tone="green" />
        <StatCard label="Overdue" value={stats.overdue} tone={stats.overdue > 0 ? "red" : undefined} />
      </div>

      {/* Board */}
      <div className="grid lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="bg-gray-50/70 rounded-2xl p-3">
              <div className="flex items-center gap-2 px-1.5 mb-3">
                <Icon className={`size-4 ${col.color}`} />
                <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                <span className="ml-auto text-xs font-bold text-gray-400 tabular-nums">{colTasks.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No tasks</p>
                )}
                {colTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    myId={myId}
                    isSuper={isSuper}
                    showAssignee={view === "team"}
                    onChange={refresh}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "blue" | "green" | "red" }) {
  const toneCls =
    tone === "blue"
      ? "text-blue-600"
      : tone === "green"
        ? "text-emerald-600"
        : tone === "red"
          ? "text-red-600"
          : "text-gray-900";
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-2xl font-bold tabular-nums mt-1 ${toneCls}`}>{value}</p>
    </div>
  );
}

function TaskCard({
  task,
  myId,
  isSuper,
  showAssignee,
  onChange,
}: {
  task: Task;
  myId?: string;
  isSuper: boolean;
  showAssignee: boolean;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = task.status !== "done" && task.due_date && task.due_date < today;
  const canDelete = isSuper || task.assigned_by === myId;

  async function setStatus(status: string) {
    setBusy(true);
    try {
      await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status }),
      });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/admin/tasks?id=${task.id}`, { method: "DELETE" });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</p>
        {canDelete && (
          <button
            onClick={remove}
            disabled={busy}
            className="p-1 -mr-1 -mt-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0"
            title="Delete task"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}

      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_STYLES[task.priority]}`}>
          <Flag className="size-2.5" /> {task.priority}
        </span>
        {task.is_recurring && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#3B5BDB] bg-[#3B5BDB]/8 px-1.5 py-0.5 rounded">
            <Repeat className="size-2.5" /> {task.recurrence}
          </span>
        )}
        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
              overdue ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            {overdue ? <AlertTriangle className="size-2.5" /> : <Calendar className="size-2.5" />}
            {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {showAssignee && task.assigned_to_name && (
        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-gray-500">
          <User className="size-3" /> {task.assigned_to_name}
        </div>
      )}
      {!showAssignee && task.assigned_by_name && task.assigned_by !== myId && (
        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-gray-500">
          <User className="size-3" /> from {task.assigned_by_name}
        </div>
      )}

      {/* Status controls */}
      <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-gray-50">
        {busy ? (
          <Loader2 className="size-3.5 animate-spin text-gray-400" />
        ) : (
          STATUS_COLUMNS.filter((c) => c.key !== task.status).map((c) => (
            <button
              key={c.key}
              onClick={() => setStatus(c.key)}
              className="text-[10px] font-medium px-2 py-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={`Move to ${c.label}`}
            >
              {c.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function AssignModal({
  onClose,
  ondone,
  canPickAssignee,
  me,
}: {
  onClose: () => void;
  ondone: () => void;
  canPickAssignee: boolean;
  me: ReturnType<typeof useAdminMe>["me"];
}) {
  const { data: teamData } = useSWR<{ members: Member[] }>(canPickAssignee ? "/api/admin/team" : null, fetcher);
  const members = teamData?.members ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("operations");
  const [dueDate, setDueDate] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("weekly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const picked = members.find((m) => m.id === assignedTo);
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          category,
          dueDate: dueDate || null,
          isRecurring: recurring,
          recurrence,
          assignedTo: assignedTo || undefined,
          assignedToEmail: picked?.email,
          assignedToName: picked?.name,
          assignedByName: me?.email,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not create task.");
        return;
      }
      ondone();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">{canPickAssignee ? "Assign a task" : "New task"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>

        {error && <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="e.g. Review new talent applications" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" placeholder="Details, links, expectations..." />
          </div>

          {canPickAssignee && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Assign to</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="form-input">
                <option value="">Myself</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {TIER_LABEL[m.tier] || m.tier}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" placeholder="operations" />
          </div>

          <div className="rounded-xl border border-gray-100 p-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="size-4 rounded border-gray-300 text-[#3B5BDB] focus:ring-[#3B5BDB]" />
              <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <Repeat className="size-4 text-[#3B5BDB]" /> Recurring / automatable task
              </span>
            </label>
            {recurring && (
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500 block mb-1">Repeats</label>
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="form-input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1.5">A fresh copy is auto-created when this one is completed.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {canPickAssignee ? "Assign task" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}
