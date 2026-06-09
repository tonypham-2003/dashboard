# Agent: operation
Phụ trách sync workflow, Vercel, Supabase, Apps Script.
Không chỉnh giao diện — UI/style thuộc agent `design`.
Credentials, column schema, architecture → xem `CLAUDE.md`.

---

## Sync workflow

**Auto (sheet edit):**
`onSheetChange` → `LockService.getScriptLock()` → POST rows → Vercel DELETE all + INSERT (dedup by `no`) → INSERT sync_log → Realtime → dashboard re-fetch

**Manual (Sync Sheet button):**
Dashboard GET `/api/sync` → Vercel gọi Apps Script web app URL → cùng flow trên

---

## Commands

```bash
# Deploy
git add <files> && git commit -m "..." && git push origin main

# Test sync
GET https://dashboard-red-mu-51.vercel.app/api/sync

# Xóa duplicate trong Supabase SQL Editor
DELETE FROM shipments WHERE id NOT IN (SELECT MIN(id) FROM shipments GROUP BY no);

# Thêm cột mới
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS <col> TEXT;
```

**Code.gs** không deploy qua git — paste vào Apps Script editor → Save → Deploy → New version.

---

## Troubleshooting

| Triệu chứng | Fix |
|-------------|-----|
| Dashboard 0 rows | Chạy `manualSync()` trong Apps Script, kiểm tra log |
| Data bị double | Chạy SQL xóa duplicate bên trên |
| Sync Sheet không phản hồi | Apps Script → Manage deployments → Edit → New version |
| Auto-sync ngừng | Chạy `setupTrigger()` trong Apps Script |
| Env var không nhận | Vercel → Settings → Environment Variables → Redeploy |

---

## Thêm cột mới (checklist)
1. Thêm cột vào Sheet
2. Cập nhật `COLS` trong `Code.gs` và `api/sync.js`
3. Cập nhật `FIELDS` + `mapSupabaseRow()` trong `index.html`
4. Chạy `ALTER TABLE` trong Supabase SQL Editor
5. Paste Code.gs mới → Save → redeploy web app
6. `git add` tất cả → commit → push
