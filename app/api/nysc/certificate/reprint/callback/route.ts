import { NextRequest, NextResponse } from "next/server";
import { confirmCertificateReprintPayment } from "@/lib/nysc/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Browser-facing redirect target after a Flutterwave checkout for a
 * certificate reprint. Mirrors /api/nysc/payment/callback — re-verifies the
 * transaction server-side rather than trusting the client-controlled
 * `status` query param.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const transactionId = searchParams.get("transaction_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (!transactionId) {
    return NextResponse.redirect(`${appUrl}/nysc/training?reprint=0`);
  }

  const result = await confirmCertificateReprintPayment(transactionId);
  return NextResponse.redirect(`${appUrl}/nysc/training?reprint=${result.success ? "1" : "0"}`);
}
