/**
 * Thin wrapper around the Flutterwave v3 REST API. Used to pay for the NYSC
 * "Get Global Workforce Ready" post-NYSC course. Docs:
 * https://developer.flutterwave.com/docs/making-payments/standard
 */

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

function secretKey() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return key;
}

export interface InitializePaymentInput {
  txRef: string;
  amount: number;
  currency?: string;
  redirectUrl: string;
  customer: { email: string; name: string; phone?: string };
  title: string;
  description: string;
}

export interface InitializePaymentResult {
  success: boolean;
  link?: string;
  error?: string;
}

/** Creates a hosted Flutterwave checkout link for a one-off payment. */
export async function initializeFlutterwavePayment(
  input: InitializePaymentInput
): Promise<InitializePaymentResult> {
  try {
    const res = await fetch(`${FLW_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: input.txRef,
        amount: input.amount,
        currency: input.currency || "NGN",
        redirect_url: input.redirectUrl,
        customer: input.customer,
        customizations: {
          title: input.title,
          description: input.description,
          logo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/images/logo-2d.png`,
        },
      }),
    });

    const body = await res.json();
    if (!res.ok || body.status !== "success" || !body.data?.link) {
      return { success: false, error: body.message || "Failed to initialize payment" };
    }

    return { success: true, link: body.data.link as string };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Flutterwave" };
  }
}

export interface VerifyTransactionResult {
  success: boolean;
  status?: "successful" | "failed" | "pending" | string;
  txRef?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  error?: string;
}

/**
 * Verifies a transaction directly against Flutterwave's servers by
 * transaction id — never trust the amount/status from a client redirect or
 * webhook payload alone.
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<VerifyTransactionResult> {
  try {
    const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${secretKey()}` },
    });

    const body = await res.json();
    if (!res.ok || body.status !== "success" || !body.data) {
      return { success: false, error: body.message || "Failed to verify transaction" };
    }

    return {
      success: true,
      status: body.data.status,
      txRef: body.data.tx_ref,
      amount: body.data.amount,
      currency: body.data.currency,
      transactionId: String(body.data.id),
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Flutterwave" };
  }
}
