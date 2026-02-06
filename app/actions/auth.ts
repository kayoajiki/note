"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerUser } from "@/lib/register";

export async function register(formData: FormData): Promise<{ error?: string; redirect?: string }> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const name = (formData.get("name") as string)?.trim() || null;
  return registerUser(email, password, name);
}

export async function updateUserName(
  name: string | null
): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "ログインしてください" };
  const trimmed = name?.trim() ?? null;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return {};
}
