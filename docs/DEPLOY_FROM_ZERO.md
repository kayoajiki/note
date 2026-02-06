# 0 からデプロイする方法（別アカウントで Vercel に新規デプロイ）

**別の Vercel アカウント**で、このプロジェクトを最初からデプロイする手順です。

---

## 前提

- **GitHub** に **kayoajiki/note** のコードが push 済みであること
- **Supabase** のプロジェクトが用意してあり、接続文字列が取れること
- デプロイに使う **Vercel のアカウント**が、GitHub の **kayoajiki/note** を参照できること（同じ GitHub アカウントでログインするか、Vercel にそのリポジトリへのアクセスを許可する）

---

## Step 1: デプロイに使う値を事前に用意する

### 1-1. 本番用の接続文字列（DATABASE_URL）

1. **Supabase** にログイン → 対象プロジェクト → **Project Settings**（歯車）→ **Database**
2. **Connection string** の **Transaction** の URL をコピー
3. **`[YOUR-PASSWORD]`** を実際の DB パスワードに置き換え（`[` と `]` は消す）
4. 末尾に **`?sslmode=require&pgbouncer=true`** を付ける

例:

```
postgresql://postgres.xxxx:パスワード@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

この **1 行** をメモ帳などに貼っておく。

### 1-2. NEXTAUTH_SECRET

ターミナルで実行し、表示された文字列をコピーしてメモ帳に貼る:

```bash
openssl rand -base64 32
```

---

## Step 2: 新しい Vercel アカウントでログインする

1. **https://vercel.com** を開く
2. **Sign Up** または **Log In**
3. **Continue with GitHub** を選ぶ
4. **デプロイしたいリポジトリ（kayoajiki/note）にアクセスできる GitHub アカウント**でログインする  
   - リポジトリが **kayoajiki** にあるなら、そのアカウントか、そのリポジトリへのアクセス権があるアカウントで GitHub にログインする
5. Vercel が GitHub へのアクセスを求めたら、**kayoajiki/note** を選べるように権限を付与する（**Configure GitHub App** などでリポジトリを選択）

---

## Step 3: 新規プロジェクトとしてインポートする

1. Vercel のダッシュボードで **「Add New…」** → **「Project」** をクリック
2. **Import Git Repository** で **GitHub** を選ぶ
3. 一覧から **kayoajiki/note** を選ぶ（検索で `note` と入力すると出ることが多い）
4. **Import** をクリック
5. **Configure Project** の画面になる（ここでいったん **Deploy は押さない**）

---

## Step 4: 環境変数を追加する（Deploy の前にやる）

**Configure Project** の画面で **Environment Variables** を開き、次の 4 つを追加する。

| Key | Value | 備考 |
|-----|--------|------|
| **DATABASE_URL** | Step 1-1 で用意した接続文字列（1 行全体） | 前後に空白を付けない |
| **NEXTAUTH_SECRET** | Step 1-2 で生成した文字列 | そのまま貼る |
| **NEXTAUTH_URL** | `https://note-xxxxx.vercel.app` のような URL | 初回は **仮の URL** でよい（次の Step で本番 URL が決まったら後から書き換えて Redeploy） |
| **BCRYPT_ROUNDS** | `8` | 数字の 8 だけ |

- **NEXTAUTH_URL** は、まだ URL が決まっていない場合は、Vercel のデフォルトのプレースホルダー（例: `https://note-xxx.vercel.app`）をそのまま使うか、デプロイ後に表示される URL をコピーしてから **Settings → Environment Variables** で編集し、**Redeploy** する。
- 各変数で **Production** にチェックを入れる。

---

## Step 5: 初回デプロイする

1. **Deploy** をクリックする
2. ビルドが完了するまで待つ（1〜3 分程度）
3. 完了すると **Visit** や **Domain** に本番 URL が表示される（例: `https://note-xxxxx.vercel.app`）
4. **NEXTAUTH_URL** をまだ仮のままにしていた場合: **Settings** → **Environment Variables** → **NEXTAUTH_URL** を **この本番 URL** に書き換え → **Save** → **Deployments** から **Redeploy**

---

## Step 6: 本番 DB にテーブルがあるか確認する

Supabase の本番 DB に、まだ Prisma のテーブル（User, Persona, Note）が無い場合だけ行う。

1. ローカルの **.env** の **DATABASE_URL** を、Supabase の **直接接続（ポート 5432）** の URL に書き換える  
   - Supabase → Project Settings → Database → **Direct connection** の URL をコピーし、`[YOUR-PASSWORD]` を置き換え、末尾に `?sslmode=require` を付ける
2. ターミナルで実行:

```bash
cd /Users/user/note/note
npx prisma migrate deploy
```

3. 終わったら **.env** の DATABASE_URL を元に戻す（本番では 6543 の Transaction URL を使う）

---

## Step 7: 初期ユーザーを作る（ログイン用）

本番に誰もユーザーがいない場合:

1. **.env** の **DATABASE_URL** を **直接接続（5432）** の Supabase URL にした状態で:

```bash
cd /Users/user/note/note
pnpm run db:seed
```

2. **.env** を元に戻す

- ログイン用: **admin@example.com** / **changeme**

---

## Step 8: 動作確認

1. 本番 URL を開く（例: `https://note-xxxxx.vercel.app`）
2. **`/api/health`** を開く → `DATABASE_URL: "設定済み"`、`db: "接続OK"` になっているか確認
3. **ログイン**（admin@example.com / changeme）または **新規登録** で動作確認

---

## まとめ（やる順番）

| # | やること |
|---|----------|
| 1 | 接続文字列と NEXTAUTH_SECRET をメモ帳に用意 |
| 2 | 新しい Vercel アカウントでログイン（GitHub で kayoajiki/note が見えるアカウント） |
| 3 | Add New → Project → GitHub の **kayoajiki/note** を Import |
| 4 | Deploy の前に Environment Variables で DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, BCRYPT_ROUNDS を追加 |
| 5 | Deploy → 本番 URL が表示されたら NEXTAUTH_URL をその URL に合わせて Redeploy（必要なら） |
| 6 | 本番 DB にテーブルが無ければ .env を直接接続にして `npx prisma migrate deploy` |
| 7 | 初期ユーザーが必要なら `pnpm run db:seed` |
| 8 | /api/health とログインで確認 |

---

## うまくいかないとき

- **リポジトリが Vercel の一覧に出ない**  
  → **Configure GitHub App** で、Vercel に **kayoajiki** アカウント（またはそのリポジトリ）へのアクセスを許可する。
- **db: "接続エラー"**  
  → DATABASE_URL のパスワード・末尾の `?sslmode=require&pgbouncer=true` を確認し、Redeploy。
- **「server configuration」**  
  → NEXTAUTH_SECRET と NEXTAUTH_URL を確認し、Redeploy。
- **新規登録が止まる**  
  → BCRYPT_ROUNDS=8、DATABASE_URL が Transaction（6543）か確認。
