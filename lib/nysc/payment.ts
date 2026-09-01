import { createClient } from "@supabase/supabase-js";
import { COURSE } from "@/lib/nysc/course-content";
import { initializeFlutterwavePayment, verifyFlutterwaveTransaction } from "@/lib/flutterwave";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function generateTxRef(userId: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `dt-nysc-${userId.slice(0, 8)}-${Date.now()}-${random}`;
}

export interface StartPaymentResult {
  success: boolean;
  link?: string;
  error?: string;
}

/**
 * Starts a Flutterwave checkout for the post-NYSC "Get Global Workforce
 * Ready" course. Records a pending row keyed by tx_ref so the callback and
 * webhook can verify against amounts/user we actually issued, not whatever a
 * client-controlled redirect claims.
 */
export async function startCoursePayment(
  userId: string,
  email: string,
  fullName: string
): Promise<StartPaymentResult> {
  const sb = serviceClient();
  const txRef = generateTxRef(userId);

  const { error: insertError } = await sb.from("nysc_course_payments").insert({
    tx_ref: txRef,
    user_id: userId,
    amount_ngn: COURSE.priceNgn,
    status: "pending",
  });

  if (insertError) {
    return { success: false, error: "Could not start payment. Please try again." };
  }

  const result = await initializeFlutterwavePayment({
    txRef,
    amount: COURSE.priceNgn,
    redirectUrl: `${appUrl()}/api/nysc/payment/callback`,
    customer: { email, name: fullName },
    title: "DeepTalent — Get Global Workforce Ready",
    description: "Post-NYSC course enrolment",
  });

  if (!result.success || !result.link) {
    return { success: false, error: result.error || "Failed to start payment" };
  }

  return { success: true, link: result.link };
}

export interface ConfirmPaymentResult {
  success: boolean;
  alreadyProcessed?: boolean;
  userId?: string;
  error?: string;
}

/**
 * Verifies a transaction against Flutterwave's own servers, then marks the
 * matching pending row (and the corps member's profile) paid. Idempotent —
 * safe to call from both the browser redirect callback and the webhook.
 */
export async function confirmCoursePayment(transactionId: string): Promise<ConfirmPaymentResult> {
  const verified = await verifyFlutterwaveTransaction(transactionId);
  if (!verified.success || !verified.txRef) {
    return { success: false, error: verified.error || "Verification failed" };
  }

  const sb = serviceClient();
  const { data: payment } = await sb
    .from("nysc_course_payments")
    .select("tx_ref, user_id, amount_ngn, status")
    .eq("tx_ref", verified.txRef)
    .maybeSingle();

  if (!payment) {
    return { success: false, error: "No matching payment record" };
  }

  if (payment.status === "successful") {
    return { success: true, alreadyProcessed: true, userId: payment.user_id };
  }

  const isValid =
    verified.status === "successful" &&
    verified.currency === "NGN" &&
    (verified.amount ?? 0) >= payment.amount_ngn;

  if (!isValid) {
    await sb.from("nysc_course_payments").update({ status: "failed" }).eq("tx_ref", verified.txRef);
    return { success: false, error: "Payment could not be verified as successful" };
  }

  const now = new Date().toISOString();

  await sb
    .from("nysc_course_payments")
    .update({ status: "successful", flutterwave_transaction_id: transactionId, verified_at: now })
    .eq("tx_ref", verified.txRef);

  await sb
    .from("profiles")
    .update({
      nysc_course_paid_at: now,
      nysc_course_payment_ref: verified.txRef,
      nysc_course_payment_amount_ngn: payment.amount_ngn,
    })
    .eq("id", payment.user_id);

  return { success: true, userId: payment.user_id };
}
