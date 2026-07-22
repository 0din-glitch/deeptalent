import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getPackage, packageTotalCredits } from "@/lib/credits/packages";

/**
 * POST /api/credits/checkout
 * Body: { packageId: string }
 * Creates a Stripe hosted Checkout session for a credit pack and returns its URL.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packageId } = await req.json();
  const pkg = getPackage(packageId);
  if (!pkg) return NextResponse.json({ error: "Invalid package" }, { status: 400 });

  const totalCredits = packageTotalCredits(pkg);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pkg.label} Pack — ${totalCredits} AI Credits`,
              description: `${pkg.credits} credits${pkg.bonus ? ` + ${pkg.bonus} bonus` : ""} for DeepTalent AI tools`,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?tab=coverLetter&credits_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?tab=coverLetter&credits_cancelled=1`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        credits: String(totalCredits),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[v0] Stripe checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
