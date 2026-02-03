# Supabase の設定確認ガイド（本番で DB が動かないとき）

本番（Vercel）で登録などが動かない場合、Supabase のどの画面で何を確認すればよいかを、画面ごとに説明します。

---

## 1. プロジェクトが止まっていないか確認する

### どこを開くか

1. ブラウザで **https://supabase.com** を開き、ログインする。
2. 左側の **「Project」** または **「All projects」** で、使っているプロジェクトをクリックする。
3. プロジェクトの **トップ画面（ダッシュボード）** を見る。

### 何を見るか

- 画面上部や中央に **「Project is paused」** や **「Paused」** と出ていないか。
- データベースの利用がしばらくないと、無料プランではプロジェクトが自動で一時停止することがあります。

### どうするか

- **「Paused」と出ている場合**
  - **「Restore project」** や **「Resume」** のようなボタンを押して、プロジェクトを再開する。
- 止まっていない場合は、この項目は問題ありません。次へ。

---

## 2. 接続文字列（DATABASE_URL）を確認する

ここで「本番用にどの URL を使うか」と「ポート番号」を確認します。

### どこを開くか

1. プロジェクトを開いた状態で、**左下の歯車アイコン** をクリックする。  
   → メニュー名は **「Project Settings」** です。
2. 左のサブメニューが開くので、**「Database」** をクリックする。  
   （General の下あたりにあります。見つからない場合は下にスクロール。）
3. **「Database」** のページが開いたら、**上から 2〜3 番目あたり** に **「Connection string」** という見出しがある。

### 何を見るか

**「Connection string」** の下に、次のような項目があります。

- **URI** というタブまたはラジオボタン
- その下に **「Transaction」** と **「Session」** の 2 つの選択肢（または 2 つのボックス）

**表示例（イメージ）:**

```
Connection string
  [URI]  [.NET]  [JDBC]  ...

  Transaction
  postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

  Session
  postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

ここで確認するのは次の 3 点です。

| 確認すること | 見る場所 | 望ましい状態 |
|--------------|----------|----------------|
| **どちらの URL を使うか** | Transaction と Session のどちらか | **Transaction** のほうを使う（本番・Vercel 向き）。 |
| **ポート番号** | URL の `:数字` の部分（`.com` の直後） | **6543** になっている（プーラー経由）。5432 だけの場合は、Transaction を選ぶと 6543 の URL になることが多い。 |
| **パスワードの入れ方** | URL 内の `[YOUR-PASSWORD]` | 実際の DB パスワードに**置き換える**。`[` や `]` は残さない。 |

### どうするか

1. **「Transaction」** のほうの URL をコピーする（クリックでコピーできることが多い）。
2. コピーした URL の **`[YOUR-PASSWORD]`** の部分を、プロジェクト作成時に自分が設定した **データベースのパスワード** に置き換える。  
   - 例: パスワードが `mypass123` なら、  
     `postgresql://postgres.xxx:[YOUR-PASSWORD]@...`  
     → `postgresql://postgres.xxx:mypass123@...`
3. 末尾のクエリを付ける。  
   - **`?sslmode=require`** が付いていなければ付ける。  
   - **Prisma で Transaction（6543）を使う場合**は、さらに **`&pgbouncer=true`** を付ける（接続モードの互換のため）。  
   - 例: `.../postgres` → `.../postgres?sslmode=require&pgbouncer=true`
4. この**完成した 1 本の URL** を、Vercel の環境変数 **DATABASE_URL** の **Value** にそのまま貼り付ける。

---

## 3. データベースのパスワードを忘れた場合（接続文字列のパスワードを変えたい場合）

### どこを開くか

1. 同じく **Project Settings（歯車）** → **Database** を開く。
2. **「Connection string」** より**上**のほうに、**「Database password」** や **「Reset database password」** という項目がある。

### 何を見るか

- **「Reset database password」** や **「Change database password」** のようなボタンやリンクがあるか。

### どうするか

- ボタンを押すと、**新しいパスワード** を設定できる。
- 新しいパスワードを決めたら、**そのパスワード** を、上で説明した接続文字列の `[YOUR-PASSWORD]` の部分に使う（Vercel の DATABASE_URL も同じパスワードに更新する）。

---

## 4. 接続の種類（直接接続とプーラー）の違い（参考）

Supabase の **Database** のページには、次の 2 種類の接続の説明が出ていることがあります。

- **Direct connection**（直接接続）  
  - ポート **5432**。  
  - 1 本の接続を長く使うような使い方向き。  
  - Vercel のようにリクエストごとに新しい接続を張る場合は、遅くなったり接続数制限に当たりやすい。

- **Connection pooling**（プーラー経由）  
  - ポート **6543**。  
  - Transaction モードや Session モードの URL がこれに当たる。  
  - 本番（Vercel）では、**こちら（Transaction の 6543 の URL）を使う**とよい。

**「どの場面をどのように見ればよいか」の答え:**

- **Project Settings → Database** を開く。
- **「Connection string」** の **「Transaction」** の URL を見て、  
  - その URL をコピーし、  
  - パスワードを置き換え、  
  - 末尾に `?sslmode=require` を付けたもの  
  が、Vercel の **DATABASE_URL** に入っているか、というところを確認すれば十分です。

---

## 5. 確認の流れのまとめ

1. **プロジェクトが Paused になっていないか**  
   → ダッシュボードのトップで「Paused」を確認し、あれば Restore。
2. **本番用の接続文字列**  
   → Project Settings → Database → Connection string の **Transaction** の URL をコピー。
3. **パスワード**  
   → `[YOUR-PASSWORD]` を実際の DB パスワードに置き換え、`[]` は付けない。
4. **SSL**  
   → 末尾に `?sslmode=require` を付ける。
5. **Vercel**  
   → 上で作った 1 本の URL を、環境変数 **DATABASE_URL** の **Value** に貼り付け、**Redeploy** する。

6. **登録が「登録中…」で止まる場合**  
   → Vercel の環境変数に **BCRYPT_ROUNDS** = **8** を追加し、再度 **Redeploy** する。  
   これでパスワードハッシュが軽くなり、10 秒タイムアウト以内に登録が完了しやすくなります。

ここまでできていれば、Supabase 側の設定として本番で問題になりやすいところは押さえられています。
