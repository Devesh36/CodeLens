import { NextResponse } from "next/server";
import { chatWithCode } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { requireAuthUserId } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code, snippetId, message, history } = await request.json();
    
    // Verify ownership
    if (snippetId) {
      const owns = await prisma.snippet.findFirst({ where: { id: snippetId, userId: authUserId } });
      if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });
      
      // Save user message
      await prisma.chatMessage.create({
        data: { role: "user", content: message, snippetId }
      });
    }

    const reply = await chatWithCode(code, history || [], message);

    // Save AI reply
    let replyMsg;
    if (snippetId) {
      replyMsg = await prisma.chatMessage.create({
        data: { role: "assistant", content: reply, snippetId }
      });
    }

    return NextResponse.json({ reply, id: replyMsg?.id });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authUserId = await requireAuthUserId();
    if (!authUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const snippetId = searchParams.get('snippetId');
    if (!snippetId) return NextResponse.json([]);

    // Verify ownership
    const owns = await prisma.snippet.findFirst({ where: { id: snippetId, userId: authUserId } });
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await prisma.chatMessage.findMany({
      where: { snippetId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
