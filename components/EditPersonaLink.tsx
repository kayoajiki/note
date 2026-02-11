"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Persona } from "@prisma/client";

export function EditPersonaLink({ personas }: { personas: Persona[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (personas.length === 0) return null;

  let personaId = searchParams.get("persona");
  if (!personaId && pathname.startsWith("/dashboard/persona/")) {
    const match = pathname.match(/^\/dashboard\/persona\/([^/]+)/);
    if (match) personaId = match[1];
  }
  const id = personaId ?? personas[0].id;
  const href = `/dashboard/persona/${id}/edit`;

  return (
    <Link
      href={href}
      className="text-sm text-neutral-600 hover:text-neutral-900"
    >
      編集
    </Link>
  );
}
