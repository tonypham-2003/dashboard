// /api/sync — Vercel Serverless Function
// Đọc Google Sheet qua CSV public URL (không cần API key, không cần OAuth)
// Được gọi bởi cron-job.org mỗi phút, hoặc bằng nút Sync trên dashboard.

const { createClient } = require('@supabase/supabase-js');

const SHEET_ID = '1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY';
const COLS = [
  'no','po_no','invoice_no','container_no','bl_no','destination_port','plant',
  'doc_rec_date','eta','ata','cus_dec_date','declaration_status','customs_line',
  'tax_pay_date','completed_cus_inspection','customs_clearance_date',
  'truck_plate','driver_telephone','pickup_at_port','deliver_to_plant','customer_complaint'
];

function parseCSV(text) {
  const lines = text.replace(/^﻿/, '').trim().split('\n');
  lines.shift(); // bỏ dòng header
  return lines.map(line => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    cols.push(cur.trim());
    return cols;
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ── Đọc Sheet qua CSV public URL (sheet phải "Anyone with link can view") ──
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
    const csvRes = await fetch(csvUrl);
    if (!csvRes.ok) throw new Error(`Không lấy được Sheet CSV: ${csvRes.status}`);

    const csvText = await csvRes.text();
    const parsed  = parseCSV(csvText);
    const rows    = parsed
      .filter(cols => cols[0] && cols[0] !== '')
      .map(cols => Object.fromEntries(COLS.map((c, i) => [c, cols[i] || ''])));

    if (rows.length === 0) {
      return res.status(200).json({ message: 'Sheet trống', rows: 0 });
    }

    // ── Lưu vào Supabase ──────────────────────────────────────────────────
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error: delErr } = await supabase.from('shipments').delete().gte('id', 0);
    if (delErr) throw delErr;

    const { error: insErr } = await supabase.from('shipments').insert(rows);
    if (insErr) throw insErr;

    // sync_log INSERT → kích hoạt Supabase Realtime → dashboard cập nhật
    await supabase.from('sync_log').insert({ rows_count: rows.length });

    console.log(`[sync] ✅ ${rows.length} rows — ${new Date().toISOString()}`);
    return res.status(200).json({ success: true, rows: rows.length });

  } catch (err) {
    console.error('[sync] ❌', err.message);
    return res.status(500).json({ error: err.message });
  }
};
