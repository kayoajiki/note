"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Persona } from "@prisma/client";
import { createNote } from "@/app/actions/note";

type HistoryItem = { title: string; body: string };

type Props = { persona: Persona; personas: Persona[] };

export function WriteForm({ persona, personas }: Props) {
  const router = useRouter();
  const [seedWords, setSeedWords] = useState("");
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [instruction, setInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState<number | null>(null);

  async function handleGenerate() {
    if (!seedWords.trim()) return;
    setGenerating(true);
    setHistory([]);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: persona.id, seedWords }),
      });
      const data = await res.json();
      if (data.title != null) setTitle(data.title);
      if (data.body != null) setBody(data.body);
      if (data.error) alert(data.error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRefine() {
    if (!title.trim() && !body.trim()) return;
    if (!instruction.trim()) return;
    setRefining(true);
    try {
      setHistory((prev) => [...prev, { title, body }]);
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: persona.id,
          title,
          body,
          instruction: instruction.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setHistory((prev) => prev.slice(0, -1));
        return;
      }
      if (data.title != null) setTitle(data.title);
      if (data.body != null) setBody(data.body);
      setInstruction("");
    } finally {
      setRefining(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert("タイトルと本文を入力してください。");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("body", body);
      formData.set("seedWords", seedWords);
      await createNote(persona.id, formData);
      setTitle("");
      setBody("");
      setSeedWords("");
      setHistory([]);
      setInstruction("");
      setExpandedHistoryIndex(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const hasContent = title.trim() || body.trim();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          アイデア・単語
        </label>
        <textarea
          value={seedWords}
          onChange={(e) => setSeedWords(e.target.value)}
          placeholder="記事にしたいキーワードやアイデアを入力"
          className="w-full h-24 px-3 py-2 border border-neutral-300 rounded-lg"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !seedWords.trim()}
          className="mt-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
        >
          {generating ? "生成中…" : "文章を生成"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h3 className="text-sm font-medium text-neutral-700 mb-2">修正履歴（参照用）</h3>
          <ul className="space-y-2">
            {history.map((item, i) => (
              <li key={i} className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedHistoryIndex(expandedHistoryIndex === i ? null : i)
                  }
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 flex items-center justify-between"
                >
                  <span>修正 {i + 1}</span>
                  <span className="text-neutral-500 truncate max-w-[60%]">{item.title || "（無題）"}</span>
                  <span className="text-neutral-400 ml-2">
                    {expandedHistoryIndex === i ? "▲" : "▼"}
                  </span>
                </button>
                {expandedHistoryIndex === i && (
                  <div className="px-3 py-2 border-t border-neutral-100 text-sm text-neutral-600 whitespace-pre-wrap">
                    <p className="font-medium text-neutral-800 mb-1">{item.title || "（無題）"}</p>
                    <p className="whitespace-pre-wrap">{item.body}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasContent && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <h3 className="text-sm font-medium text-neutral-700 mb-2">微修正</h3>
          <p className="text-xs text-neutral-500 mb-2">
            現在の文章に指示を出して修正します。修正前の内容は履歴に残ります。
          </p>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="例: もっと短く、結論を先に、語調を柔らかく"
            className="w-full h-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={handleRefine}
            disabled={refining || !instruction.trim()}
            className="mt-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 disabled:opacity-50"
          >
            {refining ? "反映中…" : "修正を反映"}
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">タイトル（現在）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="記事のタイトル"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">本文（現在）</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            placeholder="生成された文章を編集できます"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !title.trim() || !body.trim()}
          className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "保存中…" : "この内容で保存"}
        </button>
      </form>
    </div>
  );
}
