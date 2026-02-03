import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/register";

/**
 * 新規登録（API ルート）。Vercel で Server Action が応答しない問題を避けるため。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name =
      typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;

    const result = await registerUser(email, password, name);

    if (result.error) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
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
