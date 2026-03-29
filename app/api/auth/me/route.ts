import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, getTokenFromRequest } from "@/lib/auth";

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
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: String(payload.userId),
          email: String(payload.email),
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
