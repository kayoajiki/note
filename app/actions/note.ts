"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createNote(
  personaId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "ログインしてください" };
  const persona = await prisma.persona.findFirst({
    where: { id: personaId, userId: session.user.id },
  });
  if (!persona) return { error: "ペルソナが見つかりません" };
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const seedWords = (formData.get("seedWords") as string)?.trim() ?? "";
  if (!title || !body) return { error: "タイトルと本文を入力してください" };
  await prisma.note.create({
    data: { personaId, title, body, seedWords },
  });
  revalidatePath("/dashboard/notes");
}
