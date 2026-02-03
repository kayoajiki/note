import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const { persona: personaId } = await searchParams;
  const personas = await prisma.persona.findMany({ orderBy: { createdAt: "asc" } });

  const notes = await prisma.note.findMany({
    where: personaId ? { personaId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { persona: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">記事一覧</h1>
      {personas.length > 1 && (
        <p className="text-sm text-neutral-600">
          上記タブでペルソナを選ぶと、そのペルソナで書いた記事だけ表示されます。
        </p>
      )}

      {notes.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center">記事がまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="border border-neutral-200 rounded-lg p-4 bg-white">
              <Link href={`/dashboard/notes/${note.id}`} className="block">
                <h2 className="font-medium text-neutral-900 hover:underline">{note.title}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {note.persona.name} · {new Date(note.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                  {note.body.slice(0, 120)}…
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
