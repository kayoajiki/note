import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">アカウント設定</h1>
      <SettingsForm defaultName={user.name ?? ""} email={user.email} />
    </div>
  );
}
