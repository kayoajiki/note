import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export type RegisterResult = { error?: string; redirect?: string };

function getBcryptRounds(): number {
  const n = parseInt(process.env.BCRYPT_ROUNDS ?? "10", 10);
  if (!Number.isFinite(n)) return 10;
  return Math.min(12, Math.max(8, n));
}

/**
 * 新規登録の本体。API ルート・Server Action の両方から利用する。
 */
export async function registerUser(
  email: string,
  password: string,
  name: string | null
): Promise<RegisterResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }
  if (password.length < 6) {
    return { error: "パスワードは6文字以上にしてください" };
  }

  try {
    await prisma.$connect();
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existing) {
      return { error: "このメールアドレスは既に登録されています" };
    }

    const rounds = getBcryptRounds();
    const passwordHash = await bcrypt.hash(password, rounds);
    await prisma.user.create({
      data: { email: trimmedEmail, name, passwordHash },
    });

    return { redirect: "/login?registered=1" };
  } catch (e) {
    console.error("Register error:", e);
    const message =
      e instanceof Error ? e.message : "登録に失敗しました。しばらくしてからお試しください。";
    return { error: message };
  }
}
