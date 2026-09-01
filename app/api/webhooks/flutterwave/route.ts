import { NextRequest, NextResponse } from "next/server";
import { confirmCoursePayment } from "@/lib/nysc/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Flutterwave webhook — backs up the browser redirect callback in case the
 * corps member closes the tab before it fires. Verified via the shared
 * secret hash header, then re-verified against Flutterwave's API before any
 * DB write (never trust the webhook body's amount/status directly).
 * https://developer.flutterwave.com/docs/integration-guides/webhooks
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("verif-hash");
  const expected = process.env.FLUTTERWAVE_SECRET_HASH;

  if (!expected || !signature || signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const transactionId = payload?.data?.id;

  if (!transactionId) {
    return NextResponse.json({ received: true });
  }

  await confirmCoursePayment(String(transactionId));
  return NextResponse.json({ received: true });
}
