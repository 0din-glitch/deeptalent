"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return { supabase, user: data.user };
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const skillsRaw = String(formData.get("skills") ?? "");
  const langsRaw = String(formData.get("languages") ?? "");
  const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const languages = langsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const yearsRaw = formData.get("years_experience");
  const rateRaw = formData.get("hourly_rate");

  const updates: Record<string, unknown> = {
    full_name: String(formData.get("full_name") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    headline: String(formData.get("headline") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    portfolio_url: String(formData.get("portfolio_url") ?? "") || null,
    github_url: String(formData.get("github_url") ?? "") || null,
    website_url: String(formData.get("website_url") ?? "") || null,
    role_category: String(formData.get("role_category") ?? "") || null,
    specialization: String(formData.get("specialization") ?? "") || null,
    availability: String(formData.get("availability") ?? "") || null,
    currency: String(formData.get("currency") ?? "USD") || "USD",
    years_experience: yearsRaw ? Number(yearsRaw) : null,
    hourly_rate: rateRaw ? Number(rateRaw) : null,
    skills,
    languages,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function uploadResume(formData: FormData) {
  const { supabase, user } = await requireUser();
  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") ?? "Resume").trim() || "Resume";
  const notes = String(formData.get("notes") ?? "") || null;

  if (!file || file.size === 0) return { ok: false, error: "Please choose a file." };
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: "File must be 15 MB or smaller." };

  const path = `${user.id}/resumes/${Date.now()}-${safeFileName(file.name)}`;
  const { error: upErr } = await supabase.storage
    .from("talent-documents")
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  // First resume becomes primary by default.
  const { count } = await supabase
    .from("talent_resumes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  const isPrimary = (count ?? 0) === 0;

  const { error: insErr } = await supabase.from("talent_resumes").insert({
    user_id: user.id,
    title,
    notes,
    file_path: path,
    file_name: file.name,
    file_size_bytes: file.size,
    mime_type: file.type || null,
    is_primary: isPrimary,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteResume(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };

  const { data: row } = await supabase
    .from("talent_resumes")
    .select("file_path,is_primary")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (row?.file_path) {
    await supabase.storage.from("talent-documents").remove([row.file_path]);
  }
  const { error } = await supabase.from("talent_resumes").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  // If we deleted the primary, promote the most recent remaining one.
  if (row?.is_primary) {
    const { data: next } = await supabase
      .from("talent_resumes")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (next?.id) {
      await supabase.from("talent_resumes").update({ is_primary: true }).eq("id", next.id);
    }
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setPrimaryResume(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };

  await supabase.from("talent_resumes").update({ is_primary: false }).eq("user_id", user.id);
  const { error } = await supabase
    .from("talent_resumes")
    .update({ is_primary: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function getResumeDownloadUrl(filePath: string) {
  const { supabase, user } = await requireUser();
  if (!filePath.startsWith(`${user.id}/`)) return { ok: false, error: "Not authorized" };
  const { data, error } = await supabase.storage
    .from("talent-documents")
    .createSignedUrl(filePath, 60 * 5);
  if (error) return { ok: false, error: error.message };
  return { ok: true, url: data.signedUrl };
}

export async function addCertification(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Certification name is required" };

  const file = formData.get("file") as File | null;
  let file_path: string | null = null;
  let file_name: string | null = null;
  if (file && file.size > 0) {
    if (file.size > 15 * 1024 * 1024) return { ok: false, error: "File must be 15 MB or smaller." };
    const path = `${user.id}/certifications/${Date.now()}-${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from("talent-documents")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (upErr) return { ok: false, error: upErr.message };
    file_path = path;
    file_name = file.name;
  }

  const issueRaw = String(formData.get("issue_date") ?? "");
  const expiryRaw = String(formData.get("expiry_date") ?? "");

  const { error } = await supabase.from("talent_certifications").insert({
    user_id: user.id,
    name,
    issuer: String(formData.get("issuer") ?? "") || null,
    issue_date: issueRaw || null,
    expiry_date: expiryRaw || null,
    credential_id: String(formData.get("credential_id") ?? "") || null,
    credential_url: String(formData.get("credential_url") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    file_path,
    file_name,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteCertification(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };

  const { data: row } = await supabase
    .from("talent_certifications")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (row?.file_path) {
    await supabase.storage.from("talent-documents").remove([row.file_path]);
  }
  const { error } = await supabase
    .from("talent_certifications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}
