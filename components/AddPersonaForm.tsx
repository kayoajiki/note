"use client";

import { useTransition } from "react";
import { createPersona } from "@/app/actions/persona";
import { useState } from "react";

export function AddPersonaForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createPersona(new FormData(e.target as HTMLFormElement));
      setName("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ペルソナの名前（例: Aさんのペルソナ）"
        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-48"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 disabled:opacity-50"
      >
        {isPending ? "追加中…" : "新規ペルソナを追加"}
      </button>
    </form>
  );
}
