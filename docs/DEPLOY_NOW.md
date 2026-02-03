# 今からデプロイする手順（短いチェックリスト）

マイグレーションや Supabase の準備ができている前提で、**ここからデプロイ**する手順です。

---

## 1. コードを GitHub に push する

```bash
cd /Users/user/note/note
git status
```

未コミットがあれば:

```bash
git add .
git commit -m "chore: デプロイ用"
git push origin main
```

---

## 2. Vercel の環境変数を確認する

**Vercel** → 対象プロジェクト → **Settings** → **Environment Variables**

次の 4 つが **Production** に設定されているか確認する。

| Key | 値のポイント |
|-----|----------------|
| **DATABASE_URL** | Supabase の **Transaction（6543）** の URL。`[YOUR-PASSWORD]` を実際のパスワードにし、末尾 `?sslmode=require&pgbouncer=true` |
| **NEXTAUTH_SECRET** | 32文字以上のランダム文字列（`openssl rand -base64 32` で生成可） |
| **NEXTAUTH_URL** | 本番の URL（例: `https://note-xxxxx.vercel.app`）。末尾に `/` なし |
| **BCRYPT_ROUNDS** | `8` |

足りないものがあれば追加し、**Save**。

---

## 3. デプロイする

- **新規で Vercel にプロジェクトを追加する場合**: **Add New…** → **Project** → GitHub の **note** を Import → 環境変数を設定（上記）→ **Deploy**。
- **すでに Vercel にプロジェクトがある場合**: **Deployments** タブ → 最新の **⋮** → **Redeploy**。  
  （環境変数を変えた直後は必ず Redeploy。）

ビルドが完了するまで待つ。

---

## 4. 本番で初期ユーザーが必要な場合

まだ誰もユーザーがいない場合:

1. **.env** の **DATABASE_URL** を **直接接続（5432）** の Supabase URL に書き換える。
2. `pnpm run db:seed` を実行。
3. **.env** を元に戻す。

ログイン: **admin@example.com** / **changeme**

---

## 5. 動作確認

1. 本番 URL を開く（例: `https://note-xxxxx.vercel.app`）。
2. **`/api/health`** を開く → `db: "接続OK"` になっているか確認。
3. **ログイン**（admin@example.com / changeme）または **新規登録** で動作確認。

---

## うまくいかないとき

- **db: "接続エラー"** → DATABASE_URL の値（パスワード・末尾のクエリ）を確認。Redeploy。
- **「server configuration」** → NEXTAUTH_SECRET / NEXTAUTH_URL を確認。Redeploy。
- **登録が止まる** → BCRYPT_ROUNDS=8、DATABASE_URL が Transaction（6543）か確認。

詳細は **DEPLOY_FRESH_START.md** を参照。
