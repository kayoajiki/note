import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSystemPromptFromText } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text を送信してください" },
        { status: 400 }
      );
    }
    const prompt = await generateSystemPromptFromText(text);
    return NextResponse.json({ systemPrompt: prompt });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "プロンプト生成に失敗しました" },
      { status: 500 }
    );
  }
}
