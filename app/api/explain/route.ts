import { explainCode } from "@/lib/ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, explanationLanguage } = body as {
      code?: string;
      language?: string;
      explanationLanguage?: string;
    };

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Call Groq API (works for both authenticated and anonymous users)
    const explanation = await explainCode(
      code,
      language,
      explanationLanguage || "English"
    );

    return NextResponse.json(explanation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Explanation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
