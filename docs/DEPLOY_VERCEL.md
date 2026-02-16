# Vercel でデプロイする方法

## 注意: データベース

**Vercel のサーバーでは SQLite（ファイル DB）は使えません。** 本番は **PostgreSQL** などのホスト型 DB が必要です。

---

## 1. データベースを Postgres に切り替える

### 1.1 Postgres を用意する

次のいずれかで PostgreSQL を用意します。

- **Vercel Postgres**: Vercel ダッシュボードの「Storage」で作成（無料枠あり）
- **Neon**: https://neon.tech （無料枠あり）
- **Supabase**: https://supabase.com （無料枠あり）

いずれも「接続文字列」または **DATABASE_URL** が発行されます。

---

## Supabase を使う場合（手順）

### 1. Supabase でプロジェクトを作る

1. https://supabase.com にログインし、「New Project」でプロジェクトを作成する。
2. プロジェクト名・DB パスワード・リージョンを選んで作成する。

### 2. 接続文字列（DATABASE_URL）を取得する

1. Supabase ダッシュボードで、左メニュー **Project Settings**（歯車）→ **Database** を開く。
2. **Connection string** の **URI** を選ぶ。
3. **「Transaction」** または **「Session」** の接続文字列をコピーする。  
   - 形式例: `postgresql://postgres.[プロジェクトref]:[パスワード]@aws-0-[リージョン].pooler.supabase.com:5432/postgres`
4. パスワード部分 `[YOUR-PASSWORD]` を、プロジェクト作成時に設定した **DB のパスワード** に置き換える。
5. 末尾に `?sslmode=require` がなければ付ける（例: `...postgres?sslmode=require`）。

**Vercel などサーバーレスで使う場合**: そのままこの URI を `DATABASE_URL` に使ってよい。  
（接続プール用の別 URL もあるが、まずは上記の **Transaction** の URI で問題ないことが多い。）

### 3. Prisma を Postgres 用に変更する

1. **prisma/schema.prisma** の `datasource db` を次のように変更する:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. ローカルの **.env** に、Supabase の接続文字列を設定する:

```
DATABASE_URL="postgresql://postgres.[ref]:[パスワード]@aws-0-[リージョン].pooler.supabase.com:5432/postgres?sslmode=require"
```

3. マイグレーションを実行する:

```bash
npx prisma migrate dev --name init
```

4. Vercel の **Environment Variables** に、同じ `DATABASE_URL` の値を本番用として設定する。

以上で、Vercel から Supabase（Postgres）に接続できます。

---

### 1.2 Prisma を Postgres 用に変更（一般）

1. **prisma/schema.prisma** の `datasource db` を次のように変更する:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. ローカルで **.env** の `DATABASE_URL` を Postgres の URL に変更する（例: `postgresql://user:pass@host:5432/dbname?sslmode=require`）。

3. マイグレーションを実行する:

```bash
npx prisma migrate dev --name init
```

4. （任意）本番用に `prisma generate` をビルド時に実行するため、**package.json** の `scripts.build` を次のようにする:

```json
"build": "prisma generate && next build"
```

---

## 2. コードを GitHub にプッシュする

1. GitHub でリポジトリを作成する（まだの場合）。
2. ローカルでリモートを追加し、プッシュする:

```bash
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git branch -M main
git push -u origin main
```

---

## 3. Vercel にデプロイする

### 3.1 プロジェクトをインポートする

1. https://vercel.com にログインする。
2. 「Add New」→「Project」を選ぶ。
3. 対象の GitHub リポジトリを選び、「Import」する。
4. フレームワークは **Next.js** と自動検出されていればそのままでよい。

### 3.2 環境変数を設定する

Vercel のプロジェクト設定 → **Environment Variables** で、次の変数を追加する。

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | Postgres の接続文字列（本番用）。Supabase は **Transaction（ポート 6543）** の URL を使う。 |
| `NEXTAUTH_SECRET` | 32文字以上のランダム文字列 | 例: `openssl rand -base64 32` で生成 |
| `NEXTAUTH_URL` | `https://あなたのドメイン.vercel.app` | デプロイ後の URL（後から変更可） |
| `BCRYPT_ROUNDS` | `8` | **推奨。** 本番で新規登録を 10 秒以内に完了させるため。未設定時は 10（重い）。 |
| `AI_PROVIDER` | `openai` / `gemini` / `anthropic` | 使用する AI |
| `OPENAI_API_KEY` または `GEMINI_API_KEY` など | 各 API キー | 使用するプロバイダーに応じて |

**注意**: `NEXTAUTH_URL` は最初は Vercel が付ける URL（例: `https://xxx.vercel.app`）にしておき、カスタムドメインにしたらその URL に更新する。

### 3.3 ビルドコマンド

- **Build Command**: `prisma generate && next build`（上記で package.json を変えていれば `next build` のみでも可）
- **Output Directory**: 変更不要（Next.js のまま）
- **Install Command**: 変更不要（`npm install`）

### 3.4 デプロイする

「Deploy」を押す。ビルドが成功すると、表示された URL でアプリにアクセスできる。

---

## 4. 本番 DB の初期データ（任意）

本番で「初期ユーザー」を作りたい場合は、デプロイ後に一度だけシードを実行する。

- **Supabase** を使っている場合: ローカルの `.env` に本番の `DATABASE_URL`（Supabase の接続文字列）を設定してから `npm run db:seed` を実行する（**本番データが上書きされるので注意**）。
- **Vercel Postgres** を使っている場合: Vercel の「Storage」から接続情報をコピーし、同様に `.env` に設定してから `npm run db:seed` を実行する。
- または、本番環境では「新規登録」で最初のユーザーを作成する運用でもよい。

---

## 5. よくあるトラブル

### 「Application error: a server-side exception has occurred」

画面全体がこのメッセージになる場合、**Vercel のログで実際のエラー内容を確認**してください。

1. Vercel ダッシュボード → 対象プロジェクト → **Logs**（または **Deployments** → 該当デプロイ → **Functions** / **Runtime Logs**）
2. エラーが出た時刻のログを開き、`Error:` やスタックトレースを確認する。

**よくある原因と対処:**

| 原因 | 対処 |
|------|------|
| **NEXTAUTH_SECRET 未設定** | Environment Variables に `NEXTAUTH_SECRET` を追加（32文字以上のランダム文字列）。**Production** にチェックを入れる。 |
| **NEXTAUTH_URL が違う** | 本番の URL を設定する。例: `https://note-beryl-six.vercel.app`（末尾に `/` なし）。**Production** にチェック。 |
| **DATABASE_URL 未設定・誤り** | 本番用の Postgres 接続文字列を設定。Supabase の場合は **Transaction（ポート 6543）** の URL + `?sslmode=require&pgbouncer=true`。 |
| **Supabase が Paused** | Supabase ダッシュボードで「Restore project」してから再度アクセス。 |
| **マイグレーション未実行** | ローカルで `DATABASE_URL` を本番用に切り替え、`npx prisma migrate deploy` を実行してから再デプロイ。 |
| **prepared statement "s1" already exists** / **s1 does not exist** | **DATABASE_URL** の末尾に **`&pgbouncer=true`** が付いているか確認。例: `...postgres?sslmode=require&pgbouncer=true`。付いていなければ追加して Redeploy。 |

環境変数を変更したら **Redeploy**（Deployments → 最新の ⋮ → Redeploy）が必要です。

**「新規登録はできたが、ログインすると Application error」の場合:**

- **NEXTAUTH_URL** が本番の URL と**完全一致**しているか確認する。例: `https://note-beryl-six.vercel.app`（`http` や末尾の `/`、別ドメインは不可）。
- 上記のとおり **Vercel の Logs** でエラー内容を確認し、表示されたメッセージに合わせて対処する。

---

- **「DATABASE_URL が設定されていません」**: Vercel の Environment Variables に `DATABASE_URL` を追加し、値を Postgres の URL にしたか確認する。
- **「Prisma Client が生成されていない」**: Build Command に `prisma generate` を入れる（`prisma generate && next build`）。
- **ログイン後に 404**: `NEXTAUTH_URL` がデプロイ先の URL と一致しているか確認する（`https://` から始まり、末尾に `/` をつけない）。
- **API ルートで DB エラー**: 本番の `DATABASE_URL` が Postgres になっており、マイグレーション済みか確認する。
- **新規登録が「登録中…」のまま進まない**: Vercel の関数は約 10 秒でタイムアウトします。次を確認してください。(1) **DATABASE_URL** に Supabase の **Transaction（ポート 6543）** の URL を使っているか。(2) 環境変数 **BCRYPT_ROUNDS=8** を追加して Redeploy する（パスワードハッシュを軽くし、10 秒以内に収める）。

---

## まとめ

1. Postgres を用意し、`prisma/schema.prisma` を `postgresql` に変更。
2. マイグレーション実行後、コードを GitHub にプッシュ。
3. Vercel でリポジトリをインポートし、環境変数（`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, AI 関連）を設定。
4. ビルドコマンドに `prisma generate` を含めてデプロイ。
