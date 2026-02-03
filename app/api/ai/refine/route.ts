import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refineArticle } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }
  try {
    const { personaId, title, body, instruction } = await req.json();
    if (!personaId || typeof title !== "string" || typeof body !== "string" || typeof instruction !== "string") {
      return NextResponse.json(
        { error: "personaId, title, body, instruction を送信してください" },
        { status: 400 }
      );
    }
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      return NextResponse.json({ error: "ペルソナが見つかりません" }, { status: 404 });
    }
    const result = await refineArticle(title, body, instruction.trim());
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "修正に失敗しました" },
      { status: 500 }
    );
  }
}
