import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: { persona: true },
  });
  if (!note) notFound();

  return (
    <div className="space-y-6">
      <Link href="/dashboard/notes" className="text-sm text-neutral-600 hover:underline">
        ← 記事一覧
      </Link>
      <article className="bg-white border border-neutral-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-neutral-900">{note.title}</h1>
        <p className="text-sm text-neutral-500 mt-2">
          {note.persona.name} · {new Date(note.createdAt).toLocaleDateString("ja-JP")}
        </p>
        <div className="mt-6 prose prose-neutral max-w-none whitespace-pre-wrap">
          {note.body}
        </div>
        {note.seedWords && (
          <p className="mt-6 text-sm text-neutral-500 border-t pt-4">
            元になったアイデア・単語: {note.seedWords}
          </p>
        )}
      </article>
    </div>
  );
}
