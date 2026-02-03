import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/register";

const SERVER_TIMEOUT_MS = 8_000;

/**
 * 新規登録（API ルート）。Vercel の 10 秒制限内で必ずレスポンスを返す。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name =
      typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;

    const timeoutPromise = new Promise<{ error: string }>((resolve) =>
      setTimeout(
        () => resolve({ error: "処理がタイムアウトしました。しばらくしてからお試しください。" }),
        SERVER_TIMEOUT_MS
      )
    );
    const result = await Promise.race([registerUser(email, password, name), timeoutPromise]);

    if (result.error) {
      const isTimeout = result.error.includes("タイムアウト");
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: isTimeout ? 503 : 400 }
      );
    }
    return NextResponse.json({ ok: true, redirect: result.redirect });
  } catch (e) {
    console.error("Register API error:", e);
    return NextResponse.json(
      { ok: false, error: "登録に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
