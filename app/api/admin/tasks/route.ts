import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["todo", "in_progress", "blocked", "done"];
const RECURRENCES = ["daily", "weekly", "monthly"];

function nextDueDate(from: string | null, recurrence: string): string | null {
  const base = from ? new Date(from) : new Date();
  if (isNaN(base.getTime())) return null;
  if (recurrence === "daily") base.setDate(base.getDate() + 1);
  else if (recurrence === "weekly") base.setDate(base.getDate() + 7);
  else if (recurrence === "monthly") base.setMonth(base.getMonth() + 1);
  return base.toISOString().slice(0, 10);
}

// ── List tasks ───────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const scope = new URL(req.url).searchParams.get("scope") || "mine";
  let query = ctx.service.from("admin_tasks").select("*").order("created_at", { ascending: false });

  // Regular admins only see tasks they own (assigned to them) or created.
  // Super admins can request the full team board via scope=team.
  if (!(ctx.isSuperAdmin && scope === "team")) {
    query = query.or(`assigned_to.eq.${ctx.userId},assigned_by.eq.${ctx.userId}`);
  }

  const { data: tasks, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tasks: tasks ?? [], isSuperAdmin: ctx.isSuperAdmin, myId: ctx.userId });
}

// ── Create / assign a task ────────────────────────────────────────────────────
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });

  const priority = PRIORITIES.includes(body.priority) ? body.priority : "medium";
  const isRecurring = body.isRecurring === true;
  const recurrence = isRecurring && RECURRENCES.includes(body.recurrence) ? body.recurrence : null;

  // Resolve assignee (defaults to self if none provided)
  let assignedTo = body.assignedTo ? String(body.assignedTo) : ctx.userId;
  let assignedEmail: string | null = body.assignedToEmail ? String(body.assignedToEmail) : ctx.email;
  let assignedName: string | null = body.assignedToName ? String(body.assignedToName) : null;

  if (assignedTo !== ctx.userId) {
    const { data: assignee } = await ctx.service
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", assignedTo)
      .single();
    if (!assignee || assignee.role !== "admin") {
      return NextResponse.json({ error: "Assignee must be a team member." }, { status: 400 });
    }
    assignedEmail = assignee.email;
    assignedName = assignee.full_name || assignee.email;
  }

  const { data: task, error } = await ctx.service
    .from("admin_tasks")
    .insert({
      title,
      description: body.description ? String(body.description).trim() : null,
      category: body.category ? String(body.category).trim() : "operations",
      priority,
      status: "todo",
      assigned_to: assignedTo,
      assigned_to_email: assignedEmail,
      assigned_to_name: assignedName,
      assigned_by: ctx.userId,
      assigned_by_email: ctx.email,
      assigned_by_name: body.assignedByName ? String(body.assignedByName) : null,
      due_date: body.dueDate || null,
      is_recurring: isRecurring,
      recurrence,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "task.assigned",
    resource_type: "admin_task",
    resource_id: task.id,
    summary: `Assigned task "${title}" to ${assignedName || assignedEmail || "self"}`,
  });

  return NextResponse.json({ task });
}

// ── Update a task (status, progress, reassign) ────────────────────────────────
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });

  const { data: existing } = await ctx.service.from("admin_tasks").select("*").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  // Only the assignee, the assigner, or a super admin may modify.
  const canModify =
    ctx.isSuperAdmin || existing.assigned_to === ctx.userId || existing.assigned_by === ctx.userId;
  if (!canModify) return NextResponse.json({ error: "You cannot modify this task." }, { status: 403 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status && STATUSES.includes(body.status)) {
    patch.status = body.status;
    patch.completed_at = body.status === "done" ? new Date().toISOString() : null;
  }
  if (typeof body.progressNote === "string") patch.progress_note = body.progressNote.trim() || null;
  if (body.priority && PRIORITIES.includes(body.priority)) patch.priority = body.priority;
  if (body.dueDate !== undefined) patch.due_date = body.dueDate || null;

  const { data: task, error } = await ctx.service
    .from("admin_tasks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When a recurring task is completed, spawn the next occurrence automatically.
  let spawned = null;
  if (patch.status === "done" && existing.is_recurring && existing.recurrence) {
    const { data: next } = await ctx.service
      .from("admin_tasks")
      .insert({
        title: existing.title,
        description: existing.description,
        category: existing.category,
        priority: existing.priority,
        status: "todo",
        assigned_to: existing.assigned_to,
        assigned_to_email: existing.assigned_to_email,
        assigned_to_name: existing.assigned_to_name,
        assigned_by: existing.assigned_by,
        assigned_by_email: existing.assigned_by_email,
        assigned_by_name: existing.assigned_by_name,
        due_date: nextDueDate(existing.due_date, existing.recurrence),
        is_recurring: true,
        recurrence: existing.recurrence,
      })
      .select("*")
      .single();
    spawned = next;
  }

  return NextResponse.json({ task, spawned });
}

// ── Delete a task ─────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });

  const { data: existing } = await ctx.service.from("admin_tasks").select("assigned_by").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  if (!ctx.isSuperAdmin && existing.assigned_by !== ctx.userId) {
    return NextResponse.json({ error: "Only the assigner or a super admin can delete this task." }, { status: 403 });
  }

  const { error } = await ctx.service.from("admin_tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "task.deleted",
    resource_type: "admin_task",
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
