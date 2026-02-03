import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PersonaEditForm } from "@/components/PersonaEditForm";

export default async function PersonaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = await prisma.persona.findUnique({ where: { id } });
  if (!persona) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">「{persona.name}」の編集</h1>
      <PersonaEditForm persona={persona} />
    </div>
  );
}
