import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddPersonaForm } from "@/components/AddPersonaForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personas = await prisma.persona.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { notes: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ペルソナ一覧</h1>
        <AddPersonaForm />
      </div>

      {personas.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center">
          ペルソナがまだありません。「新規ペルソナを追加」から作成してください。
        </p>
      ) : (
        <ul className="space-y-3">
          {personas.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg"
            >
              <div>
                <Link
                  href={`/dashboard/persona/${p.id}/edit?persona=${p.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-sm text-neutral-500 mt-0.5">
                  記事 {p._count.notes} 件
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/persona/${p.id}/edit?persona=${p.id}`}
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  編集
                </Link>
                <Link
                  href={`/dashboard/write?persona=${p.id}`}
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  書く
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
