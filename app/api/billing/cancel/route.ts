import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { requireAuthUserId } from "@/app/actions";

export const runtime = "nodejs";

export async function POST() {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUserId },
      select: { razorpaySubscriptionId: true },
    });

    if (!user?.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);

    await prisma.user.update({
      where: { id: authUserId },
      data: {
        plan: "FREE",
        razorpaySubscriptionId: null,
        razorpayPlanId: null,
        razorpayCurrentPeriodEnd: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
