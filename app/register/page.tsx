"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.redirect) {
        router.push(result.redirect);
        return;
      }
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
