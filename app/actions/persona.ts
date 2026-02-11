"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createPersona(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "ログインしてください" };
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "名前を入力してください" };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return { error: "ユーザーが見つかりません。一度ログアウトして再ログインしてください。" };
  }
  await prisma.persona.create({
    data: { userId: session.user.id, name, systemPrompt: "", rules: "" },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/write");
  revalidatePath("/dashboard/notes");
}

export async function updatePersona(
  id: string,
  data: { name?: string; systemPrompt?: string; rules?: string }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;
  const persona = await prisma.persona.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!persona) return;
  await prisma.persona.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/persona/${id}/edit`);
  revalidatePath("/dashboard/write");
  revalidatePath("/dashboard/notes");
}

export async function deletePersona(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;
  const persona = await prisma.persona.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!persona) return;
  await prisma.persona.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/write");
  revalidatePath("/dashboard/notes");
}
