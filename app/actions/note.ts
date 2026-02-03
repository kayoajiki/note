"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createNote(
  personaId: string,
  formData: FormData
) {
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const seedWords = (formData.get("seedWords") as string)?.trim() ?? "";
  if (!title || !body) return { error: "タイトルと本文を入力してください" };
  await prisma.note.create({
    data: { personaId, title, body, seedWords },
  });
  revalidatePath("/dashboard/notes");
}
