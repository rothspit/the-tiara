# The Tiara — Cursor での開き方

## フォルダ場所（CRM サーバー）

```
/var/www/the-tiara     ← このリポジトリ（GitHub: rothspit/the-tiara）
/var/www/hitoduma-crm  ← CRM
```

## Cursor で開く

### 方法 A: 公式サイトだけ

1. Cursor → **File → Open Folder**
2. `/var/www/the-tiara` を選択

### 方法 B: CRM と公式を同時に（おすすめ）

1. Cursor → **File → Open Workspace from File**
2. `/var/www/hitoduma-crm/hitoduma-crm-tiara.code-workspace` を開く

## 初回セットアップ

```bash
cd /var/www/the-tiara
cp .env.local.example .env.local
# .env.local に Supabase のキーを入れる
npm install
npm run dev
```

→ http://localhost:3000

## 本番反映

```bash
cd /var/www/the-tiara
git add .
git commit -m "説明"
git push origin main
```

Vercel（プロジェクト **the-Tiara**）が自動デプロイします。

## CRM 連携 API

| パス | 用途 |
|------|------|
| `app/api/sync-schedule/route.ts` | CRM から出勤同期 |
| `app/api/tiara/bookings/route.ts` | サイトから予約 |

Vercel 環境変数: `SYNC_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

詳細: `/var/www/hitoduma-crm/docs/THE_TIARA_CRM_INTEGRATION.md`
