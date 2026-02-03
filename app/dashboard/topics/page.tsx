"use client";

import { useState } from "react";
import Link from "next/link";

export default function TopicsPage() {
  const [interests, setInterests] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!interests.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: interests.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ネタの取得に失敗しました");
        return;
      }
      setTopics(data.topics ?? []);
    } catch {
      setError("通信エラーです。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ネタ発掘</h1>
      <p className="text-sm text-neutral-600">
        志向・興味を入力すると、最近のトレンドを意識したブログネタを約10個提案します。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="interests"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            志向・興味
          </label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="例: 生産性、リモートワーク、健康"
            className="w-full h-24 px-3 py-2 border border-neutral-300 rounded-lg"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "取得中…" : "ネタを発掘"}
        </button>
      </form>

      {topics.length > 0 && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-white">
          <h2 className="text-sm font-medium text-neutral-700 mb-3">提案ネタ</h2>
          <ol className="list-decimal list-inside space-y-2">
            {topics.map((topic, i) => (
              <li key={i} className="flex items-center justify-between gap-4">
                <span className="text-neutral-800">{topic}</span>
                <Link
                  href={`/dashboard/write?seed=${encodeURIComponent(topic)}`}
                  className="shrink-0 text-sm text-neutral-600 hover:text-neutral-900 underline"
                >
                  このネタで書く
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
