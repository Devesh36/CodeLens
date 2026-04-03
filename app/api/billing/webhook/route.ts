import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function setProBySubscription(subscriptionId: string, status: string, currentEnd?: number) {
  const periodEnd = currentEnd ? new Date(currentEnd * 1000) : null;
  const isPro = status === "active";

  await prisma.user.updateMany({
    where: { razorpaySubscriptionId: subscriptionId },
    data: {
      plan: isPro ? "PRO" : "FREE",
      razorpayCurrentPeriodEnd: periodEnd,
    },
  });
}

export async function POST(request: Request) {
  const signature = (await headers()).get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const body = await request.text();
  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as {
    event?: string;
    payload?: {
      subscription?: {
        entity?: {
          id?: string;
          status?: string;
          current_end?: number;
        };
      };
    };
  };

  try {
    const subscription = event.payload?.subscription?.entity;
    if (!subscription?.id) {
      return NextResponse.json({ received: true });
    }

    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged":
      case "subscription.completed":
      case "subscription.pending":
      case "subscription.halted":
      case "subscription.cancelled":
        await setProBySubscription(
          subscription.id,
          subscription.status || "pending",
          subscription.current_end
        );
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
