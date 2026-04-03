import { NextResponse } from "next/server";
import { refactorCode } from "@/lib/ai";

export async function POST(request: Request) {
  try {
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
