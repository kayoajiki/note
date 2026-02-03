import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
      <h1 className="text-xl font-bold text-neutral-800 mb-2">ページが見つかりません</h1>
      <p className="text-neutral-600 mb-6 text-center">
        指定したURLは存在しないか、アクセス権がありません。
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700"
        >
          トップへ
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100"
        >
          ログイン
        </Link>
      </div>
    </div>
  );
}
