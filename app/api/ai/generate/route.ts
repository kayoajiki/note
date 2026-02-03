import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBlogPost } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }
  try {
    const { personaId, seedWords } = await req.json();
    if (!personaId || !seedWords || typeof seedWords !== "string") {
      return NextResponse.json(
        { error: "personaId と seedWords を送信してください" },
        { status: 400 }
      );
    }
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      return NextResponse.json({ error: "ペルソナが見つかりません" }, { status: 404 });
    }
    const { title, body } = await generateBlogPost(
      persona.systemPrompt,
      persona.rules,
      seedWords
    );
    return NextResponse.json({ title, body });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "記事生成に失敗しました" },
      { status: 500 }
    );
  }
}
