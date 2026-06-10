# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Architecture

```
Google Sheet → Apps Script (Code.gs) → Vercel /api/sync → Supabase → index.html
```

- **Google Sheet** is the source of truth (~2100 shipment rows). Col A empty, data B–W, headers row 2, data row 3+.
- **Code.gs** runs inside Apps Script (container-bound to the Sheet). On every sheet edit (`onChange` trigger) or GET request (`doGet`), it reads rows and POSTs to Vercel. Uses `LockService` to prevent concurrent syncs.
- **Vercel `/api/sync`** (Node.js serverless): `GET` triggers Apps Script; `POST` replaces all rows in Supabase (`DELETE + INSERT`) then writes `sync_log` to fire Realtime.
- **Supabase** (PostgreSQL, Singapore): two tables — `shipments` (22 text cols) and `sync_log`. Public SELECT via RLS. Realtime enabled on `sync_log`.
- **`index.html`** is the entire frontend: React 18 CDN + Babel + Chart.js + supabase-js. No build step. Fetches on load, re-fetches via WebSocket whenever `sync_log` gets a new row.

---

## Sub-agents

| Agent | File | Scope |
|-------|------|-------|
| `design` | `.claude/agents/design.md` | UI, layout, charts, table styling, KPI cards — edit `index.html` only |
| `operation` | `.claude/agents/operation.md` | Sync workflow, Supabase, Vercel, Apps Script, troubleshooting |

---

## Deploy

No build step. Every `git push origin main` triggers an automatic Vercel deploy.

```bash
git add <files>
git commit -m "description"
git push origin main
```

`Code.gs` is **not** deployed via git — paste it manually into the Apps Script editor, then **Deploy → Manage deployments → New version**.

---

## Key constraints

- `SUPABASE_SERVICE_KEY` must never be committed — Vercel env only.
- Vercel cannot fetch `docs.google.com`; Apps Script cannot reach Supabase directly. All data flows through the two-hop: Apps Script → Vercel → Supabase.
- After editing Code.gs: redeploy Apps Script web app (new version required for `doGet` changes).
- After adding/changing a Vercel env var: manually redeploy (env is cached at build time).

---

## Column mapping (Sheet → Supabase)

`getRange(3, 2, lastRow-2, 22)` — starts row 3, col B. `r[1]` = `po_no` is the filter key (skip if empty).

`r[0]`=no · `r[1]`=po_no · `r[2]`=invoice_no · `r[3]`=container_no · `r[4]`=bl_no · `r[5]`=cus_dec_no · `r[6]`=destination_port · `r[7]`=plant · `r[8]`=doc_rec_date · `r[9]`=cus_dec_date · `r[10]`=declaration_status · `r[11]`=customs_line · `r[12]`=tax_pay_date · `r[13]`=completed_cus_inspection · `r[14]`=customs_clearance_date · `r[15]`=truck_plate · `r[16]`=driver_telephone · `r[17]`=pickup_at_port · `r[18]`=deliver_to_plant · `r[19]`=eta · `r[20]`=ata · `r[21]`=customer_complaint

---

## Credentials

| | Value | Location |
|-|-------|----------|
| Supabase URL | `https://shuiloynbgpazmipxckz.supabase.co` | `index.html` + Vercel env `SUPABASE_URL` |
| Supabase anon key | `eyJhbGci...4AlY` | `index.html` hardcoded (read-only) |
| Supabase service key | 220-char key | Vercel env `SUPABASE_SERVICE_KEY` only |
| Apps Script web app | `https://script.google.com/macros/s/AKfycbyzDiMe_QbZhq2Q9cJhVeM0_I7N10hQAFp4ry5blyuunFluDaNsN5WGR2ZzRGxC69l-Gg/exec` | `api/sync.js` |
| Vercel URL | `https://dashboard-red-mu-51.vercel.app` | `Code.gs`, `api/sync.js` |
| GitHub repo | `https://github.com/tonypham-2003/dashboard` | git remote origin |
