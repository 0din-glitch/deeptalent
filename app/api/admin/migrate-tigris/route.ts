import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

const TIGRIS_ENDPOINT = "https://deeptalent-platform.t3.storage.dev";

function inferContentType(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return (
    ({
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    } as Record<string, string>)[ext] ?? "application/octet-stream"
  );
}

function parseKey(key: string) {
  const slash = key.indexOf("/");
  if (slash === -1) return null;
  const bucket = key.slice(0, slash);
  const rest = key.slice(slash + 1);
  if (!["avatars", "verification"].includes(bucket)) return null;

  const firstDash = rest.indexOf("-");
  const userRef = firstDash > -1 ? rest.slice(0, firstDash) : null;
  const parts = rest.split("-");
  const filename = parts.length > 2 ? parts.slice(2).join("-") : rest;

  return { bucket, storagePath: rest, userRef, filename };
}

async function listAllKeys() {
  const keys: string[] = [];
  let continuationToken: string | null = null;

  while (true) {
    const url = new URL(TIGRIS_ENDPOINT);
    url.searchParams.set("list-type", "2");
    if (continuationToken) url.searchParams.set("continuation-token", continuationToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Tigris list failed: ${res.status}`);
    const xml = await res.text();

    const keyMatches = xml.match(/<Key>([^<]+)<\/Key>/g) ?? [];
    for (const m of keyMatches) keys.push(m.replace(/<\/?Key>/g, ""));

    const isTruncated = xml.match(/<IsTruncated>([^<]+)<\/IsTruncated>/)?.[1] === "true";
    if (!isTruncated) break;
    const next = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)?.[1];
    if (!next) break;
    continuationToken = next;
  }
  return keys;
}

export async function POST() {
  // Auth: must be logged-in admin
  const serverClient = await createServerClient();
  const { data: userData } = await serverClient.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await serverClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const keys = await listAllKeys();
  let ok = 0;
  let skipped = 0;
  let errored = 0;
  const errors: { key: string; error: string }[] = [];

  for (let i = 0; i < keys.length; i += 5) {
    const chunk = keys.slice(i, i + 5);
    await Promise.all(
      chunk.map(async (key) => {
        const parsed = parseKey(key);
        if (!parsed) {
          skipped++;
          return;
        }
        const { bucket, storagePath, userRef, filename } = parsed;

        const { data: existing } = await admin
          .from("legacy_files")
          .select("id")
          .eq("bucket", bucket)
          .eq("storage_path", storagePath)
          .maybeSingle();
        if (existing) {
          skipped++;
          return;
        }

        const dlRes = await fetch(`${TIGRIS_ENDPOINT}/${encodeURI(key)}`);
        if (!dlRes.ok) {
          errored++;
          errors.push({ key, error: `download ${dlRes.status}` });
          return;
        }
        const buffer = Buffer.from(await dlRes.arrayBuffer());
        const contentType = dlRes.headers.get("content-type") || inferContentType(filename);

        const { error: upErr } = await admin.storage
          .from(bucket)
          .upload(storagePath, buffer, { contentType, upsert: true });
        if (upErr) {
          errored++;
          errors.push({ key, error: `upload ${upErr.message}` });
          return;
        }

        const { error: dbErr } = await admin.from("legacy_files").insert({
          bucket,
          storage_path: storagePath,
          legacy_user_ref: userRef,
          file_name: filename,
          size_bytes: buffer.byteLength,
          content_type: contentType,
          source: "tigris",
        });
        if (dbErr) {
          errored++;
          errors.push({ key, error: `db ${dbErr.message}` });
          return;
        }
        ok++;
      })
    );
  }

  return NextResponse.json({
    total: keys.length,
    migrated: ok,
    skipped,
    errored,
    errors: errors.slice(0, 20),
  });
}
