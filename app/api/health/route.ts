import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 本番デバッグ用: 環境変数と DB 接続を確認し、エラーがあれば内容を返す。
 * 原因が分かったらこのファイルは削除してよい。
 */
export async function GET() {
  const checks: Record<string, string> = {};

  checks.DATABASE_URL = process.env.DATABASE_URL ? "設定済み" : "未設定";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "設定済み" : "未設定";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "未設定";
  checks.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? "未設定（デフォルト10）";

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "接続OK";
  } catch (e) {
    checks.db = "接続エラー";
    checks.dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(checks, { status: 200 });
}
