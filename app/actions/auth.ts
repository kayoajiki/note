"use server";

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function register(formData: FormData): Promise<{ error?: string; redirect?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || null;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }
  if (password.length < 6) {
    return { error: "パスワードは6文字以上にしてください" };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { error: "このメールアドレスは既に登録されています" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, passwordHash },
    });

    return { redirect: "/login?registered=1" };
  } catch (e) {
    console.error("Register error:", e);
    const message = e instanceof Error ? e.message : "登録に失敗しました。しばらくしてからお試しください。";
    return { error: message };
  }
}
