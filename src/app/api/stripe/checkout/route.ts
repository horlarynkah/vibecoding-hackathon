import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function resolveStripePriceId(
  stripe: Stripe,
  configuredId: string,
): Promise<string> {
  if (configuredId.startsWith("price_")) {
    return configuredId;
  }

  if (configuredId.startsWith("prod_")) {
    const product = await stripe.products.retrieve(configuredId, {
      expand: ["default_price"],
    });
    const defaultPrice = product.default_price;
    const resolvedPriceId =
      typeof defaultPrice === "string" ? defaultPrice : defaultPrice?.id;

    if (!resolvedPriceId) {
      throw new Error(
        "STRIPE_PRICE_ID points to a product without a default price. Set STRIPE_PRICE_ID to a price_... id or set the product default price in Stripe.",
      );
    }

    if (!resolvedPriceId.startsWith("price_")) {
      throw new Error(
        "Resolved default_price was not a price_... id. Set STRIPE_PRICE_ID to a price_... id.",
      );
    }

    return resolvedPriceId;
  }

  throw new Error(
    "STRIPE_PRICE_ID must be a Stripe price_... id (recommended) or a prod_... product id with a default price.",
  );
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const configuredStripeId = requireEnv("STRIPE_PRICE_ID");
    const priceId = await resolveStripePriceId(stripe, configuredStripeId);
    const appUrl = requireEnv("NEXT_PUBLIC_URL");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, stripeCustomerId: true },
    });
    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      allow_promotion_codes: true,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e: unknown) {
    const message =
      e instanceof Error && e.message ? e.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

