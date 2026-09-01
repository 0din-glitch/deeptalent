import { NextRequest, NextResponse } from "next/server";
import { confirmCoursePayment } from "@/lib/nysc/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Browser-facing redirect target after a Flutterwave checkout. Flutterwave
 * appends `status`, `tx_ref` and `transaction_id` as query params — we only
 * use `transaction_id` and re-verify it server-side rather than trusting the
 * client-controlled `status` param.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const transactionId = searchParams.get("transaction_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (!transactionId) {
    return NextResponse.redirect(`${appUrl}/nysc/training?enrolled=0`);
  }

  const result = await confirmCoursePayment(transactionId);
  return NextResponse.redirect(`${appUrl}/nysc/training?enrolled=${result.success ? "1" : "0"}`);
}
