import { NextRequest, NextResponse } from "next/server";
import { refactorCode } from "@/lib/ai";
import { getTokenFromRequest, verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const bearerToken = getTokenFromRequest(request);
    const cookieToken = request.cookies.get("auth")?.value;
    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(payload.userId) },
      select: { plan: true },
    });

    if (!user || user.plan !== "PRO") {
      return NextResponse.json(
        { error: "Pro plan required" },
        { status: 403 }
      );
    }

    const { code, language, instruction } = await request.json();
    if (!code || !instruction) {
      return NextResponse.json(
        { error: "Code and instruction are required" },
        { status: 400 }
      );
    }
    const result = await refactorCode(code, language || "auto", instruction);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Refactor error:", error);
    return NextResponse.json(
      { error: "Failed to refactor code" },
      { status: 500 }
    );
  }
}
