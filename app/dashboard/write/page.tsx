import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WriteForm } from "@/components/WriteForm";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; seed?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { persona: personaId, seed: initialSeed } = await searchParams;
  const personas = await prisma.persona.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (personas.length === 0) {
    return (
      <p className="text-neutral-500 py-8 text-center">
        まずダッシュボードでペルソナを1つ以上作成してください。
      </p>
    );
  }

  const selectedPersona = personaId
    ? personas.find((p) => p.id === personaId) ?? personas[0]
    : personas[0];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">記事を書く</h1>
      <p className="text-sm text-neutral-600">
        使用するペルソナ: <strong>{selectedPersona.name}</strong>
        {!personaId && personas.length > 1 && (
          <span className="ml-2">（タブで切り替え）</span>
        )}
      </p>
      <WriteForm persona={selectedPersona} personas={personas} initialSeed={initialSeed} />
    </div>
  );
}
