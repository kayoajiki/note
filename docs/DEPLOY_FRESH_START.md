# デプロイを一からやり直す手順

ローカルは動いているが本番だけうまくいかない場合に、**全てのデプロイを一からやり直す**ためのチェックリストです。

---

## 前提

- **Supabase** のプロジェクトはそのまま使う（既存の DB を使う）
- **GitHub** のリポジトリもそのまま使う
- **Vercel** のプロジェクトは「削除して作り直す」か「環境変数だけ消して入れ直す」のどちらか

---

## Step 0: ローカルでやること（5分）

### 0-1. 変更がすべて GitHub に入っているか確認

```bash
cd /Users/user/note/note
git status
```

- 未コミットの変更があれば:

```bash
git add .
git commit -m "chore: デプロイ前の整理"
git push origin main
```

### 0-2. 本番用の接続文字列を 1 本用意する（メモ帳に貼っておく）

1. **Supabase** → Project Settings → Database → **Connection string**
2. **Transaction** の URL をコピー
3. **`[YOUR-PASSWORD]`** を実際の DB パスワードに置き換え（`[` `]` は消す）
4. 末尾に **`?sslmode=require&pgbouncer=true`** を付ける

例（パスワードを `mypass` にした場合）:

```
postgresql://postgres.zigivdfhrmkufdpvvpci:mypass@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

この **1 行** をメモ帳などに貼っておく。あとで Vercel の **DATABASE_URL** にそのまま貼る。

### 0-3. NEXTAUTH_SECRET を 1 つ用意する

ターミナルで実行:

```bash
openssl rand -base64 32
```

表示された文字列をコピーしてメモ帳に貼っておく。Vercel の **NEXTAUTH_SECRET** に貼る。

---

## Step 1: Vercel をやり直す（2パターン）

### パターンA: いったんプロジェクトを削除して作り直す（すっきりやりたい人）

1. **Vercel** ダッシュボード → 対象の **note** プロジェクトを開く
2. **Settings** → 一番下の **「Delete Project」** でプロジェクトを削除
3. **Add New…** → **Project** をクリック
4. **Import Git Repository** で **GitHub** を選び、**kayoajiki/note**（またはあなたのリポジトリ名）を選択
5. **Import** をクリック
6. **Configure Project** の画面では、いったん **Deploy** は押さず、**Environment Variables** を先に設定する（Step 2 へ）

### パターンB: プロジェクトはそのまま、環境変数だけ消して入れ直す

1. **Vercel** → 対象プロジェクト → **Settings** → **Environment Variables**
2. 既存の **DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, BCRYPT_ROUNDS** を **削除**（編集でも可だが、値が正しいか不安なら削除して追加し直す）
3. 次の Step 2 で **新規追加** する

---

## Step 2: Vercel の環境変数を「この順で」追加する

**Settings** → **Environment Variables** で、以下を **1 つずつ** 追加する。  
**Key** はコピペで typo を防ぐ。**Production / Preview / Development** は必要に応じてチェック（本番だけなら Production のみ）。

| # | Key | Value | メモ |
|---|-----|--------|------|
| 1 | `DATABASE_URL` | Step 0-2 で作った接続文字列（1行全体） | コピペ。前後に空白を付けない。 |
| 2 | `NEXTAUTH_SECRET` | Step 0-3 で作った 32 文字以上の文字列 | コピペ。 |
| 3 | `NEXTAUTH_URL` | 本番の URL（例: `https://note-xxxxx.vercel.app`） | 末尾に `/` を付けない。 |
| 4 | `BCRYPT_ROUNDS` | `8` | 数字の 8 だけ。 |

追加したら **Save** を押す。

---

## Step 3: デプロイする

- **パターンA** で新規 Import した場合: **Deploy** を押して初回デプロイ。
- **パターンB** の場合: **Deployments** タブ → 最新のデプロイの **⋮** → **Redeploy**。

ビルドが完了するまで待つ（1〜3 分程度）。

---

## Step 4: 本番 DB にテーブルがあるか確認する

Supabase の本番 DB に、まだ Prisma のテーブル（User, Persona, Note）が無い場合は、**ローカル**で 1 回だけマイグレーションを流す。

**重要**: `prisma migrate deploy` は **直接接続（ポート 5432）** で行う。Transaction プーラー（6543）だと接続が止まることがある。

### 4-1. 直接接続の URL を用意する

1. **Supabase** → Project Settings → **Database** → **Connection string**
2. **「Direct connection」** または **「URI」でポート 5432** の接続文字列をコピーする。  
   ホストは **`db.zigivdfhrmkufdpvvpci.supabase.co`** のような形式（`pooler.supabase.com` ではない）。
3. **`[YOUR-PASSWORD]`** を実際のパスワードに置き換え、末尾に **`?sslmode=require`** を付ける。  
   例: `postgresql://postgres.zigivdfhrmkufdpvvpci:パスワード@db.zigivdfhrmkufdpvvpci.supabase.co:5432/postgres?sslmode=require`

### 4-2. マイグレーションを実行する

1. **.env** の **DATABASE_URL** を、上で作った**直接接続の URL（5432）** に書き換える。
2. ターミナルで実行:

```bash
cd /Users/user/note/note
npx prisma migrate deploy
```

3. 成功したら（「X migrations applied」や「No pending migrations」）、**.env** の DATABASE_URL を**元に戻す**。  
   本番アプリ・Vercel では **Transaction プーラー（6543）** の URL のまま使う。

（既にテーブルがある場合は「No pending migrations」などと出て何も変わらない。）

---

## Step 5: 初期ユーザーを作る（ログイン用）

本番で誰もユーザーがいない場合、シードで 1 人作る。

**Step 4 と同様、.env の DATABASE_URL を本番用に書き換えた状態で** 次を実行する（書き換え済みならそのまま実行でよい）:

```bash
cd /Users/user/note/note
pnpm run db:seed
```

終わったら **.env** の DATABASE_URL を元に戻す。

- ログイン用: **admin@example.com** / **changeme**

---

## Step 6: 動作確認

1. **本番 URL** を開く（例: `https://note-xxxxx.vercel.app`）
2. **`/api/health`** を開く（例: `https://note-xxxxx.vercel.app/api/health`）
   - `DATABASE_URL`: "設定済み"
   - `db`: "接続OK"
   - になっていれば OK
3. **ログイン**する（admin@example.com / changeme）
4. 必要なら **新規登録** も試す

---

## うまくいかないとき

- **`/api/health` で db が「接続エラー」**  
  → DATABASE_URL の値（パスワード・末尾の `?sslmode=require&pgbouncer=true`）を見直す。
- **「There is a problem with the server configuration」**  
  → NEXTAUTH_SECRET と NEXTAUTH_URL が入っているか、Redeploy したか確認。
- **新規登録が「登録中…」のまま**  
  → BCRYPT_ROUNDS=8 が入っているか、DATABASE_URL が Transaction（6543）か確認。

---

## まとめ（やること一覧）

1. ローカルで `git push` まで完了させる
2. 接続文字列・NEXTAUTH_SECRET をメモ帳に用意
3. Vercel でプロジェクトを削除して作り直す **か** 環境変数だけ消して追加し直す
4. DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL / BCRYPT_ROUNDS を **この名前で** 追加
5. デプロイ（または Redeploy）
6. 必要なら本番 DB に `prisma migrate deploy` と `db:seed`
7. `/api/health` とログインで確認

この順でやれば、デプロイを一からやり直した状態になります。
