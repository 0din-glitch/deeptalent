import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

/**
 * Uploads the recorded interview video to the private `interview-videos` bucket.
 * Path is scoped under the user's id so it can never collide with others.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("video");
  const interviewId = String(form.get("interviewId") || "");
  const durationRaw = form.get("duration");
  const duration = durationRaw ? Number(durationRaw) : null;

  if (!(file instanceof Blob)) {
    return Response.json({ error: "No video file" }, { status: 400 });
  }
  if (!interviewId) {
    return Response.json({ error: "Missing interviewId" }, { status: 400 });
  }

  // Verify the interview belongs to this user before storing.
  const { data: interview, error: lookupErr } = await supabase
    .from("talent_interviews")
    .select("id")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (lookupErr || !interview) {
    return Response.json({ error: "Interview not found" }, { status: 404 });
  }

  const ext = file.type.includes("mp4") ? "mp4" : "webm";
  const path = `${user.id}/${interviewId}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from("interview-videos")
    .upload(path, arrayBuffer, {
      contentType: file.type || "video/webm",
      upsert: true,
    });

  if (uploadErr) {
    console.log("[v0] interview video upload error:", uploadErr.message);
    return Response.json({ error: uploadErr.message }, { status: 500 });
  }

  const { error: updateErr } = await supabase
    .from("talent_interviews")
    .update({
      video_path: path,
      video_duration_seconds: duration && !Number.isNaN(duration) ? Math.round(duration) : null,
    })
    .eq("id", interviewId)
    .eq("user_id", user.id);

  if (updateErr) {
    console.log("[v0] interview video metadata error:", updateErr.message);
  }

  return Response.json({ ok: true, path });
}
