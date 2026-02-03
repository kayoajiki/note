import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { suggestBlogTopics } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const interests = typeof body.interests === "string" ? body.interests.trim() : "";
    if (!interests) {
      return NextResponse.json(
        { error: "interests を送信してください" },
        { status: 400 }
      );
    }
    const trendsHint =
      typeof body.trendsHint === "string" ? body.trendsHint.trim() : undefined;
    const topics = await suggestBlogTopics(interests, trendsHint);
    return NextResponse.json({ topics });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "ネタの取得に失敗しました" },
      { status: 500 }
    );
  }
}
