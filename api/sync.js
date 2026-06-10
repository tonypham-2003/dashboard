// /api/sync — nhận data từ Apps Script (POST) hoặc trigger thủ công
const { createClient } = require('@supabase/supabase-js');

const COLS = [
  'no','po_no','invoice_no','container_no','bl_no','cus_dec_no','destination_port','plant',
  'doc_rec_date','cus_dec_date','declaration_status','customs_line',
  'tax_pay_date','completed_cus_inspection','customs_clearance_date',
  'truck_plate','driver_telephone','pickup_at_port','deliver_to_plant','eta','ata','customer_complaint'
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SURL = process.env.SUPABASE_URL;
  const SKEY = process.env.SUPABASE_SERVICE_KEY;

  // GET → trigger Apps Script to sync
  if (req.method === 'GET') {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzDiMe_QbZhq2Q9cJhVeM0_I7N10hQAFp4ry5blyuunFluDaNsN5WGR2ZzRGxC69l-Gg/exec';
    fetch(APPS_SCRIPT_URL).catch(() => {});
    return res.json({ triggered: true, message: 'Sync đang chạy, dashboard sẽ cập nhật trong vài giây.' });
  }

  try {
    let rows = [];

    if (req.method === 'POST') {
      const body = req.body || {};
      rows = body.rows || [];
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'rows trống hoặc sai định dạng' });
      }
    }

    const supabase = createClient(SURL, SKEY);

    // Use upsert-by-no to prevent race condition doubles (two syncs running simultaneously)
    const deduped = [...new Map(rows.map(r => [r.no, r])).values()];
    const { error: delErr } = await supabase.from('shipments').delete().gte('id', 0);
    if (delErr) throw delErr;

    const { error: insErr } = await supabase.from('shipments').insert(deduped);
    if (insErr) throw insErr;

    await supabase.from('sync_log').insert({ rows_count: rows.length });

    console.log(`[sync] ✅ ${rows.length} rows — ${new Date().toISOString()}`);
    return res.status(200).json({ success: true, rows: rows.length });

  } catch (err) {
    console.error('[sync] ❌', err.message);
    return res.status(500).json({ error: err.message });
  }
};
