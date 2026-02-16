"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { Persona } from "@prisma/client";
import { updatePersona, deletePersona } from "@/app/actions/persona";

type Props = { persona: Persona };

export function PersonaEditForm({ persona }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(persona.name);
  const [systemPrompt, setSystemPrompt] = useState(persona.systemPrompt);
  const [rules, setRules] = useState(persona.rules);
  const [pasteText, setPasteText] = useState("");
  const [noteUrls, setNoteUrls] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [fetchingNote, setFetchingNote] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleGenerateFromPaste() {
    if (!pasteText.trim()) return;
    setGeneratingPrompt(true);
    setPromptError(null);
    try {
      const res = await fetch("/api/ai/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      let data: { systemPrompt?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        setPromptError("サーバーからの応答を読み取れませんでした。APIキー（.env の GEMINI_API_KEY など）を確認してください。");
        return;
      }
      if (!res.ok) {
        setPromptError(data.error ?? "プロンプトの生成に失敗しました。");
        return;
      }
      if (data.systemPrompt && data.systemPrompt.trim()) {
        setSystemPrompt(data.systemPrompt.trim());
      } else {
        setPromptError("生成結果が空でした。APIキーとモデルを確認するか、もう一度お試しください。");
      }
    } catch (err) {
      setPromptError("通信エラーです。APIキー（.env）を設定し、開発サーバーを再起動しましたか？");
    } finally {
      setGeneratingPrompt(false);
    }
  }

  async function handleFetchNote() {
    const urls = noteUrls
      .split(/\n/)
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      setPromptError("noteのURLを1行に1つ入力してください。");
      return;
    }
    setFetchingNote(true);
    setPromptError(null);
    try {
      const fetchRes = await fetch("/api/fetch-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const fetchData = await fetchRes.json();
      if (fetchData.error) {
        setPromptError(fetchData.error);
        return;
      }
      const text = fetchData.text;
      if (!text) {
        setPromptError("本文を取得できませんでした。");
        return;
      }
      setPasteText(text);
    } catch {
      setPromptError("通信エラーです。APIキーを設定し、開発サーバーを再起動しましたか？");
    } finally {
      setFetchingNote(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updatePersona(persona.id, { name, systemPrompt, rules });
      router.refresh();
    });
  }

  async function handleDelete() {
    if (
      !confirm(
        "このペルソナを削除しますか？紐づく記事も削除され、元に戻せません。"
      )
    )
      return;
    setDeleting(true);
    await deletePersona(persona.id);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">表示名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          required
        />
      </div>

      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-3">
        <h2 className="font-medium text-neutral-800">noteのURL または 文章からプロンプトを生成</h2>
        <p className="text-xs text-neutral-500">
          1. noteのURLを入力 → 本文取得 → プロンプト自動生成。URLがない場合は下の欄に直接テキストを貼り付けられます。 .env で AI_PROVIDER と対応する APIキーを設定してください。
        </p>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">1. noteのURLを入力（1行1URL）</label>
          <p className="text-xs text-neutral-500 mb-1">
            記事URLから本文を取得します。取得した本文は下の欄（2）に表示されます。
          </p>
          <textarea
            value={noteUrls}
            onChange={(e) => setNoteUrls(e.target.value)}
            placeholder="https://note.com/..."
            className="w-full h-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={handleFetchNote}
            disabled={fetchingNote}
            className="mt-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 disabled:opacity-50"
          >
            {fetchingNote ? "取得中…" : "本文を取得"}
          </button>
        </div>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            2. 本文を確認してプロンプトを生成（または直接貼り付け）
          </label>
          <p className="text-xs text-neutral-500 mb-1">
            上でURLから取得した本文がここに表示されます。確認・編集してから「プロンプトを生成」を押してください。URLがない場合は、直接文章を貼り付けてプロンプトを生成できます。
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="過去に書いた文章を貼り付けてください"
            className="w-full h-32 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={handleGenerateFromPaste}
            disabled={generatingPrompt || !pasteText.trim()}
            className="mt-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 disabled:opacity-50"
          >
            {generatingPrompt ? "生成中…" : "プロンプトを生成"}
          </button>
        </div>
        {promptError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {promptError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">システムプロンプト</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="このペルソナの文体・考え方を定義するプロンプト"
          className="w-full h-48 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">追加ルール</label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="例: 一人称で書く、専門用語を避ける"
          className="w-full h-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || isPending}
          className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "削除中…" : "ペルソナを削除"}
        </button>
      </div>
    </form>
  );
}
