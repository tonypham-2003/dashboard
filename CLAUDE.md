# T&C Dashboard — Agent Guide

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  GOOGLE SHEETS  (Master file - Report / Sheet1)              │
│  21 cols A–U · ~2100 rows of shipment data                   │
└──────────────────┬───────────────────────────────────────────┘
                   │ onChange trigger  OR  doGet() call
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  APPS SCRIPT  (Code.gs — container-bound to the Sheet)       │
│  onSheetChange() → syncNow()     [auto on every edit]        │
│  doGet()         → syncNow()     [called by Vercel GET]      │
│  syncNow(): reads Sheet1, filters col B ≠ "",                │
│             POST { rows:[...] } to Vercel /api/sync          │
│  Web App: script.google.com/macros/s/AKfycbyzDiMe_...exec   │
└──────────────────┬───────────────────────────────────────────┘
                   │ POST { rows: [...] }
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  VERCEL  (api/sync.js — Node.js serverless)                  │
│  https://dashboard-red-mu-51.vercel.app                      │
│  GET  /api/sync → fires Apps Script URL (triggers sync)      │
│  POST /api/sync → DELETE all shipments → INSERT rows         │
│                   → INSERT sync_log (triggers Realtime)      │
│  Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY                │
└──────────────────┬───────────────────────────────────────────┘
                   │ supabase-js REST
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  SUPABASE  (PostgreSQL · Singapore ap-southeast-1)           │
│  https://shuiloynbgpazmipxckz.supabase.co                    │
│  Table: shipments  (21 text cols + bigserial id)             │
│  Table: sync_log   (id, synced_at, rows_count)               │
│  RLS: public SELECT on both · Realtime ON for sync_log       │
└──────────────────┬───────────────────────────────────────────┘
                   │ WebSocket — fires on every sync_log INSERT
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  DASHBOARD  (index.html — Vercel static)                     │
│  https://dashboard-red-mu-51.vercel.app                      │
│  Stack: React 18 CDN · Babel · Chart.js · supabase-js        │
│  Anon key hardcoded (read-only)                              │
│  On load: SELECT * FROM shipments                            │
│  Realtime: sync_log INSERT → re-fetch → re-render            │
│  "Sync Sheet" button → GET /api/sync → Apps Script → sync   │
└──────────────────────────────────────────────────────────────┘
```

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entire frontend — React, charts, Supabase client, UI |
| `api/sync.js` | Vercel serverless — receives rows from Apps Script, writes Supabase |
| `Code.gs` | Apps Script — reads Sheet, POSTs to Vercel; also web app doGet |
| `vercel.json` | `{"outputDirectory":".","framework":null}` — static, no build |
| `package.json` | Node 24.x · dep: `@supabase/supabase-js` only |
| `supabase-schema.sql` | Reference — already deployed, don't re-run unless resetting |

---

## Credentials

| What | Value | Where stored |
|------|-------|--------------|
| Supabase project URL | `https://shuiloynbgpazmipxckz.supabase.co` | index.html + Vercel env `SUPABASE_URL` |
| Supabase anon key | `eyJhbGci...4AlY` | index.html hardcoded (read-only) |
| Supabase service key | `eyJhbGci...iQ` (220 chars) | Vercel env `SUPABASE_SERVICE_KEY` only — never commit |
| Apps Script web app URL | `https://script.google.com/macros/s/AKfycbyzDiMe_QbZhq2Q9cJhVeM0_I7N10hQAFp4ry5blyuunFluDaNsN5WGR2ZzRGxC69l-Gg/exec` | api/sync.js hardcoded |
| Vercel production URL | `https://dashboard-red-mu-51.vercel.app` | Code.gs + api/sync.js |
| GitHub repo | `https://github.com/tonypham-2003/dashboard` | git remote origin |
| Google Sheet ID | `1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY` | reference only |

---

## Column Schema (Sheet1, row 2+, 21 columns A–U)

| Col | Index | JS camelCase | DB snake_case | Notes |
|-----|-------|-------------|---------------|-------|
| A | 0 | no | no | Row number — often empty, not used as filter |
| B | 1 | poNo | po_no | **Filter key** — empty = skip row |
| C | 2 | invoiceNo | invoice_no | |
| D | 3 | containerNo | container_no | |
| E | 4 | blNo | bl_no | |
| F | 5 | destinationPort | destination_port | Cat Lai / Cai Mep / Da Nang / Hai Phong / Lach Huyen |
| G | 6 | plant | plant | HCMC / Hanoi / Bac Ninh / Dong Nai / Binh Duong / Da Nang / Hai Phong |
| H–P | 7–15 | dates + status | text cols | Format: `HH:mm - DD Mon` |
| M | 12 | customsLine | customs_line | Green / Yellow / Red |
| Q | 16 | truckPlate | truck_plate | |
| R | 17 | driverTelephone | driver_telephone | |
| S | 18 | pickupAtPort | pickup_at_port | Yes / No |
| T | 19 | deliverToPlant | deliver_to_plant | Yes / No |
| U | 20 | customerComplaint | customer_complaint | No Complaint / Late Delivery |

---

## Common Tasks for This Agent

### Deploy any change
```bash
git add <files>
git commit -m "description"
git push origin main        # Vercel auto-deploys
```
**Never commit** the Supabase service role key.

### Change UI / KPIs / charts
Edit `index.html` only. No build step — React runs via Babel CDN in browser.

### Change sync column logic
Edit `Code.gs` → `syncNow()` function → the `.filter()` line (currently filters `r[1] !== ''`).
After editing: paste updated code into Apps Script editor → redeploy web app.

### Test sync manually
```
# Trigger via browser or curl:
GET https://dashboard-red-mu-51.vercel.app/api/sync
→ Returns {"triggered":true} and Apps Script syncs in background

# Or run directly in Apps Script editor:
manualSync()
```

### If dashboard shows 0 / no data
1. Run `manualSync()` in Apps Script — check log for `✅ Thành công`
2. Verify Supabase → Table Editor → shipments table has rows
3. Verify Vercel env vars set correctly for **Production** environment

### If Sync Sheet button stops working
Check Apps Script web app is still deployed: open the web app URL in browser → should return `{"ok":true}`.
If expired, redeploy: Apps Script → Deploy → Manage deployments → Edit → New version → Deploy.

### If auto-sync stops (sheet edits don't update dashboard)
Run `setupTrigger()` in Apps Script to reinstall the onChange trigger.

### Add env var to Vercel
Vercel → project → Settings → Environment Variables → tick **Production** checkbox → Save → **Redeploy**.
Env vars are case-sensitive. Redeploy required after any change.

---

## Known Constraints

| Constraint | Reason |
|-----------|--------|
| Vercel cannot fetch from `docs.google.com` | Google blocks cloud provider IPs |
| Apps Script cannot reach Supabase directly | DNS failure from Google's network |
| Service role key must never be in committed code | Security — goes in Vercel env vars only |
| Vercel env var names are case-sensitive | `SUPABASE_URL` ≠ `supabase_url` |
| Must redeploy after env var changes | Vercel caches env at build time |
| After editing Apps Script, must redeploy web app | New version required for doGet changes |

---

## Supabase SQL Reference

```sql
-- Recreate tables if needed
create table if not exists shipments (
  id bigserial primary key,
  no text, po_no text, invoice_no text, container_no text, bl_no text,
  destination_port text, plant text, doc_rec_date text, eta text, ata text,
  cus_dec_date text, declaration_status text, customs_line text,
  tax_pay_date text, completed_cus_inspection text, customs_clearance_date text,
  truck_plate text, driver_telephone text, pickup_at_port text,
  deliver_to_plant text, customer_complaint text
);
create table if not exists sync_log (
  id bigserial primary key,
  synced_at timestamptz default now(),
  rows_count int
);
alter table shipments enable row level security;
alter table sync_log enable row level security;
create policy "public read shipments" on shipments for select using (true);
create policy "public read sync_log" on sync_log for select using (true);
alter publication supabase_realtime add table sync_log;
```
