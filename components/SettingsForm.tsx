"use client";

import { useState, useTransition } from "react";
import { updateUserName } from "@/app/actions/auth";

type Props = { defaultName: string; email: string };

export function SettingsForm({ defaultName, email }: Props) {
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateUserName(name || null);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: "名前を更新しました。" });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-100 text-neutral-500"
        />
        <p className="text-xs text-neutral-500 mt-1">メールアドレスは変更できません。</p>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
          表示名
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          placeholder="名前（任意）"
        />
      </div>
      {message && (
        <p
          className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}
          role="alert"
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
      >
        {isPending ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
