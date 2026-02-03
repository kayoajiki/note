"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = e.currentTarget;
      const email = (form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? "").trim();
      const password = form.querySelector<HTMLInputElement>('[name="password"]')?.value ?? "";
      const name = (form.querySelector<HTMLInputElement>('[name="name"]')?.value ?? "").trim() || null;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const rawText = await res.text();
      const data = rawText ? (() => { try { return JSON.parse(rawText); } catch { return {}; } })() : {};

      if (res.ok && data.ok && data.redirect) {
        router.push(data.redirect);
        return;
      }
      const serverError = data.error ?? (res.ok ? "登録に失敗しました。" : "");
      const statusInfo = res.status !== 200 ? ` [HTTP ${res.status}]` : "";
      setError(serverError ? `${serverError}${statusInfo}` : `エラーが発生しました。${statusInfo} しばらくしてからお試しください。${rawText ? ` (${rawText.slice(0, 80)}…)` : ""}`);
    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      setError(isAbort ? "通信がタイムアウトしました（20秒）。しばらくしてからお試しください。" : "通信に失敗しました。ネットワークまたは本番の設定を確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-xl font-bold text-center mb-6">新規登録</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              パスワード（6文字以上）
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              名前（任意）
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
              autoComplete="name"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? "登録中…" : "登録"}
          </button>
          <p className="text-center text-sm text-neutral-500 mt-4">
            <Link href="/login" className="text-neutral-700 hover:underline">ログインはこちら</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
