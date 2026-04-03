import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/db";
import { requireAuthUserId } from "@/app/actions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUserId },
      select: { email: true, name: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === "PRO") {
      return NextResponse.json({ error: "Already on Pro" }, { status: 400 });
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      return NextResponse.json(
        { error: "Missing RAZORPAY_PLAN_ID" },
        { status: 500 }
      );
    }

    const totalCountEnv = Number.parseInt(
      process.env.RAZORPAY_TOTAL_COUNT || "12",
      10
    );
    const totalCount = Number.isNaN(totalCountEnv) ? 12 : totalCountEnv;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: Math.max(1, totalCount),
      customer_notify: 1,
      notes: { userId: authUserId },
    });

    await prisma.user.update({
      where: { id: authUserId },
      data: {
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: planId,
      },
    });

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Razorpay checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
