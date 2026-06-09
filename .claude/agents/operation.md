# Agent: operation
Phụ trách toàn bộ code backend, workflow, kết nối Vercel ↔ Supabase ↔ Google Sheet.
Không chỉnh giao diện — mọi UI change thuộc agent `design`.

---

## Kiến trúc tổng quan
```
Google Sheet (Master file - Report / Sheet1)
  │  onChange trigger hoặc doGet()
  ▼
Apps Script (Code.gs) — đọc sheet, POST rows lên Vercel
  │  POST { rows: [...] }
  ▼
Vercel /api/sync (api/sync.js) — DELETE all → INSERT → ghi sync_log
  │  supabase-js
  ▼
Supabase (PostgreSQL) — bảng shipments + sync_log
  │  Realtime WebSocket (sync_log INSERT)
  ▼
Dashboard (index.html) — tự re-fetch khi nhận Realtime event
```

---

## URLs & Credentials
| Thứ | Giá trị |
|-----|---------|
| Dashboard | https://dashboard-red-mu-51.vercel.app |
| Vercel sync endpoint | https://dashboard-red-mu-51.vercel.app/api/sync |
| Apps Script web app | https://script.google.com/macros/s/AKfycbyzDiMe_QbZhq2Q9cJhVeM0_I7N10hQAFp4ry5blyuunFluDaNsN5WGR2ZzRGxC69l-Gg/exec |
| Supabase URL | https://shuiloynbgpazmipxckz.supabase.co |
| Supabase anon key | eyJhbGci...4AlY (hardcode trong index.html, read-only) |
| Supabase service key | **Vercel env `SUPABASE_SERVICE_KEY` ONLY — không bao giờ commit** |
| GitHub repo | https://github.com/tonypham-2003/dashboard |
| Google Sheet ID | 1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY |

---

## Files
| File | Vai trò |
|------|---------|
| `api/sync.js` | Vercel serverless: GET → trigger Apps Script, POST → DELETE+INSERT Supabase |
| `Code.gs` | Apps Script: đọc sheet row 3+, col B-W, POST lên Vercel |
| `vercel.json` | `{"outputDirectory":".","framework":null}` |
| `package.json` | Node 24.x, dep: `@supabase/supabase-js` only |
| `supabase-schema.sql` | Schema reference (đã deploy, không chạy lại trừ khi reset) |

---

## Schema Google Sheet → Supabase
- Col A: **trống** (row index) — Apps Script đọc từ col B
- Row 2: headers, Row 3+: data
- `getRange(3, 2, lastRow-2, 22)` → r[0]=colB(no) … r[21]=colW(customer_complaint)
- Filter: `r[1] !== ''` → bỏ hàng không có PO No

| r[i] | DB column | Ghi chú |
|------|-----------|---------|
| 0 | no | Số thứ tự hàng |
| 1 | po_no | **Filter key** |
| 2 | invoice_no | |
| 3 | container_no | |
| 4 | bl_no | |
| 5 | cus_dec_no | |
| 6 | destination_port | Cat Lai / Cai Mep / Da Nang / Hai Phong / Lach Huyen |
| 7 | plant | HCMC / Hanoi / Bac Ninh / Dong Nai / Binh Duong |
| 8–21 | doc_rec_date … customer_complaint | Xem CLAUDE.md để biết đầy đủ |

---

## Sync workflow chi tiết

### Auto sync (sheet edit)
1. Apps Script `onSheetChange` bắt onChange event
2. `LockService.getScriptLock()` — chặn chạy đồng thời (tránh double data)
3. POST rows lên Vercel `/api/sync`
4. Vercel: DELETE all shipments → INSERT rows (dedup by `no`) → INSERT sync_log
5. Supabase Realtime → dashboard re-fetch

### Manual sync (Sync Sheet button)
1. Dashboard GET `/api/sync` → Vercel gọi Apps Script URL
2. Apps Script chạy `syncNow()` → cùng flow trên

---

## Các lệnh thường dùng

```bash
# Deploy thay đổi
git add <files> && git commit -m "..." && git push origin main

# Test sync thủ công
GET https://dashboard-red-mu-51.vercel.app/api/sync

# Xóa duplicate trong Supabase (chạy trong SQL Editor)
DELETE FROM shipments WHERE id NOT IN (SELECT MIN(id) FROM shipments GROUP BY no);
```

---

## Troubleshooting

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Dashboard 0 rows | Sync chưa chạy hoặc lỗi | Chạy `manualSync()` trong Apps Script |
| Data bị double | Race condition 2 sync đồng thời | Chạy SQL xóa duplicate; LockService đã được cài |
| Sort sai (1,10,100) | Supabase order by TEXT | Frontend sort bằng `parseInt(b.no)-parseInt(a.no)` |
| Sync Sheet không phản hồi | Apps Script web app hết hạn | Redeploy: Manage deployments → New version |
| Auto-sync ngừng | onChange trigger bị mất | Chạy `setupTrigger()` trong Apps Script |
| Env var không nhận | Chưa redeploy Vercel | Vercel → Settings → Redeploy |

---

## Constraints quan trọng
- Vercel không fetch được `docs.google.com` (Google chặn cloud IP)
- Apps Script không kết nối trực tiếp Supabase (DNS ENOTFOUND)
- Service key **không bao giờ** commit vào git
- Env var case-sensitive: `SUPABASE_URL` ≠ `supabase_url`
- Sau khi sửa Code.gs phải **redeploy Apps Script web app** (New version)
- Sau khi thêm/sửa Vercel env var phải **Redeploy** thủ công
