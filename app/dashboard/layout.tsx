import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { DashboardNav } from "@/components/DashboardNav";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personas = await prisma.persona.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-neutral-900">
          ペルソナブログ
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900">
            ホーム
          </Link>
          <Link href="/dashboard/write" className="text-sm text-neutral-600 hover:text-neutral-900">
            書く
          </Link>
          <Link href="/dashboard/topics" className="text-sm text-neutral-600 hover:text-neutral-900">
            ネタ発掘
          </Link>
          <Link href="/dashboard/notes" className="text-sm text-neutral-600 hover:text-neutral-900">
            記事一覧
          </Link>
          <Link href="/dashboard/settings" className="text-sm text-neutral-600 hover:text-neutral-900">
            設定
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <DashboardNav personas={personas} />
      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
