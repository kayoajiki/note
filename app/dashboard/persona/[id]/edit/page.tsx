import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PersonaEditForm } from "@/components/PersonaEditForm";

export default async function PersonaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const persona = await prisma.persona.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!persona) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">「{persona.name}」の編集</h1>
      <PersonaEditForm persona={persona} />
    </div>
  );
}
