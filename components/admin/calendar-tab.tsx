"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Link2,
  List,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Unplug,
  X,
  AlertTriangle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Status = {
  configured: boolean;
  connected: boolean;
  googleEmail: string | null;
  calendarId: string;
  connectedAt: string | null;
};

type EventItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  htmlLink?: string;
  synced?: boolean;
};

export function CalendarTab() {
  const { data: status } = useSWR<Status>("/api/admin/calendar/status", fetcher);
  const { data: eventsData, isLoading } = useSWR<{ source: string; events: EventItem[] }>(
    "/api/admin/calendar/events",
    fetcher
  );
  const [showCreate, setShowCreate] = useState(false);
  const [createStart, setCreateStart] = useState<string>("");
  const [disconnecting, setDisconnecting] = useState(false);
  const [view, setView] = useState<"month" | "list">("month");
  const [cursor, setCursor] = useState(() => new Date());

  const events = eventsData?.events || [];

  async function disconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/admin/calendar/disconnect", { method: "POST" });
      mutate("/api/admin/calendar/status");
      mutate("/api/admin/calendar/events");
    } finally {
      setDisconnecting(false);
    }
  }

  function openCreate(prefill?: string) {
    setCreateStart(prefill || "");
    setShowCreate(true);
  }

  return (
    <div className="space-y-6">
      {/* Connection banner */}
      <ConnectionBanner status={status} onDisconnect={disconnect} disconnecting={disconnecting} />

      {/* Header + create */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Meetings &amp; schedule</h3>
          <p className="text-sm text-gray-500">
            {eventsData?.source === "google"
              ? "Live from your connected Google Calendar."
              : "Saved locally. Connect Google Calendar to sync automatically."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setView("month")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                view === "month" ? "bg-[#3B5BDB] text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarDays className="size-3.5" /> Month
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                view === "list" ? "bg-[#3B5BDB] text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="size-3.5" /> List
            </button>
          </div>
          <button
            onClick={() => mutate("/api/admin/calendar/events")}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="size-4" />
          </button>
          <button
            onClick={() => openCreate()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            <Plus className="size-4" /> Schedule meeting
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : view === "month" ? (
        <MonthCalendar
          events={events}
          cursor={cursor}
          onPrev={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          onNext={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          onToday={() => setCursor(new Date())}
          onSelectDay={(d) => openCreate(toLocalInput(d))}
        />
      ) : events.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <Calendar className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">No upcoming meetings</p>
          <p className="text-xs text-gray-400 mt-1">Schedule one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateMeetingModal
          onClose={() => setShowCreate(false)}
          connected={!!status?.connected}
          defaultStart={createStart}
        />
      )}
    </div>
  );
}

/** Formats a Date to a `yyyy-MM-ddTHH:mm` value for datetime-local inputs (local tz). */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthCalendar({
  events,
  cursor,
  onPrev,
  onNext,
  onToday,
  onSelectDay,
}: {
  events: EventItem[];
  cursor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDay: (d: Date) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay()); // back up to Sunday

  // 6 weeks × 7 days = 42 cells for a stable grid
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }

  // Group events by local yyyy-mm-dd
  const byDay = new Map<string, EventItem[]>();
  for (const e of events) {
    const d = new Date(e.start);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(e);
  }
  for (const list of byDay.values()) list.sort((a, b) => +new Date(a.start) - +new Date(b.start));

  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h4 className="text-base font-bold text-gray-900">
          {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h4>
        <div className="flex items-center gap-1">
          <button onClick={onToday} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            Today
          </button>
          <button onClick={onPrev} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Previous month">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={onNext} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Next month">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const dayEvents = byDay.get(key) ?? [];
          return (
            <button
              key={i}
              onClick={() => onSelectDay(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0))}
              className={`group text-left min-h-[92px] p-1.5 border-b border-r border-gray-100 last:border-r-0 transition-colors hover:bg-[#3B5BDB]/[0.03] ${
                inMonth ? "bg-white" : "bg-gray-50/50"
              } ${i % 7 === 6 ? "border-r-0" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold ${
                    isToday(d)
                      ? "bg-[#3B5BDB] text-white"
                      : inMonth
                      ? "text-gray-700"
                      : "text-gray-300"
                  }`}
                >
                  {d.getDate()}
                </span>
                <Plus className="size-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#3B5BDB]/10 text-[#3B5BDB] text-[10px] font-medium truncate"
                    title={e.title}
                  >
                    <span className="tabular-nums opacity-70">
                      {new Date(e.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span className="truncate">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="px-1.5 text-[10px] font-medium text-gray-400">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConnectionBanner({
  status,
  onDisconnect,
  disconnecting,
}: {
  status?: Status;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  if (!status) {
    return <div className="h-16 rounded-2xl bg-gray-50 animate-pulse" />;
  }

  // Credentials not added yet
  if (!status.configured) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Google Calendar not configured</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Add <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_ID</code> and{" "}
            <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code> in project settings to enable
            two-way sync. Until then, meetings are saved locally and still generate an “Add to Google Calendar” link in
            emails.
          </p>
        </div>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Connected to Google Calendar</p>
            <p className="text-xs text-emerald-700">{status.googleEmail}</p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-60"
        >
          {disconnecting ? <Loader2 className="size-3.5 animate-spin" /> : <Unplug className="size-3.5" />}
          Disconnect
        </button>
      </div>
    );
  }

  // Configured but not connected
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#3B5BDB]/[0.04] border border-[#3B5BDB]/15">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-[#3B5BDB]/10 grid place-items-center">
          <Calendar className="size-5 text-[#3B5BDB]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Connect your Google Calendar</p>
          <p className="text-xs text-gray-500">Two-way sync for meetings scheduled here.</p>
        </div>
      </div>
      <a
        href="/api/admin/calendar/connect"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
      >
        <Link2 className="size-4" /> Connect
      </a>
    </div>
  );
}

function EventRow({ event }: { event: EventItem }) {
  const start = new Date(event.start);
  const dateStr = start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex flex-col items-center justify-center size-12 rounded-lg bg-[#3B5BDB]/8 shrink-0">
        <span className="text-[10px] font-bold uppercase text-[#3B5BDB]">
          {start.toLocaleString("en-US", { month: "short" })}
        </span>
        <span className="text-base font-bold text-[#3B5BDB] leading-none">{start.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
          <span>{dateStr}</span>
          {event.location && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="size-3" /> {event.location}
            </span>
          )}
        </div>
      </div>
      {event.synced && (
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Synced</span>
      )}
      {event.htmlLink && (
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-gray-400 hover:text-[#3B5BDB] hover:bg-gray-50"
          title="Open in Google Calendar"
        >
          <ExternalLink className="size-4" />
        </a>
      )}
    </div>
  );
}

function CreateMeetingModal({
  onClose,
  connected,
  defaultStart,
}: {
  onClose: () => void;
  connected: boolean;
  defaultStart?: string;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(defaultStart || "");
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !start) {
      setError("Title and start time are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const startDate = new Date(start);
      const end = new Date(startDate.getTime() + duration * 60_000).toISOString();
      const res = await fetch("/api/admin/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start: startDate.toISOString(),
          end,
          location,
          attendees: attendees.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to schedule.");
        return;
      }
      mutate("/api/admin/calendar/events");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarPlus className="size-5 text-[#3B5BDB]" /> Schedule meeting
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="Intro call" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Start</label>
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Duration (min)</label>
              <input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="form-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Location / video link</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="form-input" placeholder="https://meet.google.com/..." />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Attendee emails</label>
            <input value={attendees} onChange={(e) => setAttendees(e.target.value)} className="form-input" placeholder="comma or space separated" />
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-3">
          {connected
            ? "This will create the event on your Google Calendar and invite attendees."
            : "Saved locally. Connect Google Calendar to auto-sync and send invites."}
        </p>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
          Schedule
        </button>
      </div>
    </div>
  );
}
