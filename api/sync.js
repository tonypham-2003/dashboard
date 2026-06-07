// /api/sync — Vercel Serverless Function
// Nhận data từ Apps Script (POST), lưu vào Supabase, trigger realtime.
// KHÔNG dùng Google Sheets API — Apps Script tự đọc sheet và gửi data lên đây.

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sync-secret');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Xác thực secret ────────────────────────────────────────────────────
  if (process.env.SYNC_SECRET) {
    const secret = req.body?.secret || req.headers['x-sync-secret'];
    if (secret !== process.env.SYNC_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // ── GET: health check / manual trigger test ────────────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'Sync endpoint ready' });
  }

  // ── POST: nhận data từ Apps Script ────────────────────────────────────
  const { rows } = req.body || {};
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Thiếu trường rows trong body' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Xóa toàn bộ dữ liệu cũ
    const { error: delErr } = await supabase
      .from('shipments')
      .delete()
      .gte('id', 0);
    if (delErr) throw delErr;

    // Insert dữ liệu mới
    const { error: insErr } = await supabase
      .from('shipments')
      .insert(rows);
    if (insErr) throw insErr;

    // Ghi sync_log → kích hoạt Supabase Realtime trên dashboard
    const { error: logErr } = await supabase
      .from('sync_log')
      .insert({ rows_count: rows.length });
    if (logErr) throw logErr;

    console.log(`[sync] ✅ ${rows.length} rows at ${new Date().toISOString()}`);
    return res.status(200).json({ success: true, rows: rows.length });

  } catch (err) {
    console.error('[sync] ❌', err.message);
    return res.status(500).json({ error: err.message });
  }
};
