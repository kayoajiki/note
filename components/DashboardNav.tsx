"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Persona } from "@prisma/client";

export function DashboardNav({ personas }: { personas: Persona[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPersonaId = searchParams.get("persona");

  if (personas.length === 0) return null;

  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-2">
      <div className="flex items-center gap-1 overflow-x-auto">
        <span className="text-neutral-500 text-sm mr-2 shrink-0">ペルソナ:</span>
        {personas.map((p) => {
          const isActive =
            currentPersonaId === p.id ||
            (pathname.startsWith("/dashboard/persona") && pathname.includes(p.id));
          return (
            <Link
              key={p.id}
              href={
                pathname.startsWith("/dashboard/write")
                  ? `/dashboard/write?persona=${p.id}`
                  : pathname.startsWith("/dashboard/notes")
                    ? `/dashboard/notes?persona=${p.id}`
                    : `/dashboard?persona=${p.id}`
              }
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {p.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
