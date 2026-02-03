"use server";

import { registerUser } from "@/lib/register";

export async function register(formData: FormData): Promise<{ error?: string; redirect?: string }> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const name = (formData.get("name") as string)?.trim() || null;
  return registerUser(email, password, name);
}
