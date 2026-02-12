import { explainCode } from "@/lib/ai";
import { verifyJWT, getTokenFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Optional authentication - allow both authenticated and anonymous requests
    const token = getTokenFromRequest(request);
    let userId = null;
    
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Call Groq API (works for both authenticated and anonymous users)
    const explanation = await explainCode(code, language);

    return NextResponse.json(explanation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Explanation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
