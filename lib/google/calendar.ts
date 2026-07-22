import "server-only";

/**
 * Google Calendar integration groundwork.
 *
 * Everything here is gated behind GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
 * Until those env vars are present, `isCalendarConfigured()` returns false and
 * the UI shows a "connect credentials" state instead of calling Google.
 *
 * No network calls are made unless credentials exist.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CAL_API = "https://www.googleapis.com/calendar/v3";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
];

export function isCalendarConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** The redirect URI Google will call back. Must be whitelisted in the Google console. */
export function calendarRedirectUri(origin: string): string {
  const base = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/admin/calendar/callback`;
  return base;
}

/** Builds the Google OAuth consent URL. */
export function buildAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: calendarRedirectUri(origin),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  id_token?: string;
};

/** Exchanges an authorization code for tokens. */
export async function exchangeCode(code: string, origin: string): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: calendarRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json();
}

/** Refreshes an access token using a stored refresh token. */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return res.json();
}

/** Decodes the email from a Google id_token (no verification needed for display). */
export function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = idToken.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return json.email || null;
  } catch {
    return null;
  }
}

export type CalendarEventInput = {
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO
  end: string; // ISO
  attendees?: string[];
};

/** Creates an event on the given calendar. Returns the Google event id + html link. */
export async function createGoogleEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEventInput
): Promise<{ id: string; htmlLink: string }> {
  const res = await fetch(
    `${GOOGLE_CAL_API}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        location: event.location,
        start: { dateTime: new Date(event.start).toISOString() },
        end: { dateTime: new Date(event.end).toISOString() },
        attendees: (event.attendees || []).map((email) => ({ email })),
      }),
    }
  );
  if (!res.ok) throw new Error(`Create event failed: ${await res.text()}`);
  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink };
}

/** Lists upcoming events from the given calendar. */
export async function listGoogleEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  maxResults = 50
): Promise<Array<{ id: string; title: string; start: string; end: string; htmlLink: string; location?: string }>> {
  const params = new URLSearchParams({
    timeMin,
    maxResults: String(maxResults),
    singleEvents: "true",
    orderBy: "startTime",
  });
  const res = await fetch(
    `${GOOGLE_CAL_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`List events failed: ${await res.text()}`);
  const data = await res.json();
  return (data.items || []).map((e: Record<string, any>) => ({
    id: e.id,
    title: e.summary || "(no title)",
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    htmlLink: e.htmlLink,
    location: e.location,
  }));
}
