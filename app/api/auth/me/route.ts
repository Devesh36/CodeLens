import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const bearerToken = getTokenFromRequest(request);
    const cookieToken = request.cookies.get("auth")?.value;
    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyJWT(token);
    if (!payload?.userId || !payload?.email) {
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set("auth", "", { path: "/", maxAge: 0 });
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: String(payload.userId) },
      select: { id: true, email: true, plan: true },
    });

    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set("auth", "", { path: "/", maxAge: 0 });
      return response;
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
