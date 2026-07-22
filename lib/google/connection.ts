import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refreshAccessToken } from "@/lib/google/calendar";

export type CalendarConnection = {
  admin_id: string;
  google_email: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: string | null;
  calendar_id: string;
};

/**
 * Returns a valid access token for an admin, refreshing it if expired.
 * Returns null when the admin has no connection.
 */
export async function getValidAccessToken(
  service: SupabaseClient,
  adminId: string
): Promise<{ token: string; calendarId: string } | null> {
  const { data } = await service
    .from("google_calendar_connections")
    .select("*")
    .eq("admin_id", adminId)
    .maybeSingle();

  const conn = data as CalendarConnection | null;
  if (!conn || !conn.access_token) return null;

  const expiry = conn.token_expiry ? new Date(conn.token_expiry).getTime() : 0;
  const stillValid = expiry - Date.now() > 60_000; // 1 min buffer

  if (stillValid) return { token: conn.access_token, calendarId: conn.calendar_id };

  // Refresh
  if (!conn.refresh_token) return null;
  const refreshed = await refreshAccessToken(conn.refresh_token);
  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await service
    .from("google_calendar_connections")
    .update({ access_token: refreshed.access_token, token_expiry: newExpiry, updated_at: new Date().toISOString() })
    .eq("admin_id", adminId);

  return { token: refreshed.access_token, calendarId: conn.calendar_id };
}
