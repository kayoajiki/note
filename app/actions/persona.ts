"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createPersona(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "名前を入力してください" };
  await prisma.persona.create({
    data: { name, systemPrompt: "", rules: "" },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/write");
  revalidatePath("/dashboard/notes");
}

export async function updatePersona(
  id: string,
  data: { name?: string; systemPrompt?: string; rules?: string }
) {
  await prisma.persona.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/persona/${id}/edit`);
  revalidatePath("/dashboard/write");
  revalidatePath("/dashboard/notes");
}

export async function deletePersona(id: string) {
  await prisma.persona.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/write");
  revalidatePath("/dashboard/notes");
}
