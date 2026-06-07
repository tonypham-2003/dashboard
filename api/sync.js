// /api/sync — nhận data từ Apps Script (POST) hoặc trigger thủ công
const { createClient } = require('@supabase/supabase-js');

const COLS = [
  'no','po_no','invoice_no','container_no','bl_no','destination_port','plant',
  'doc_rec_date','eta','ata','cus_dec_date','declaration_status','customs_line',
  'tax_pay_date','completed_cus_inspection','customs_clearance_date',
  'truck_plate','driver_telephone','pickup_at_port','deliver_to_plant','customer_complaint'
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SURL = process.env.SUPABASE_URL;
  const SKEY = process.env.SUPABASE_SERVICE_KEY;

  // GET → diagnostic
  if (req.method === 'GET') {
    const results = { url: SURL || 'MISSING', key: SKEY ? `set(${SKEY.length})` : 'MISSING' };
    // Test 1: basic internet
    try { await fetch('https://httpbin.org/get'); results.internet = 'ok'; }
    catch (e) { results.internet = e.message; }
    // Test 2: Supabase ping
    try {
      const t = await fetch(`${SURL}/rest/v1/`, { headers: { apikey: SKEY } });
      results.supabase = `HTTP ${t.status}`;
    } catch (e) {
      results.supabase = e.message;
      results.cause = e.cause ? String(e.cause) : undefined;
    }
    return res.json(results);
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

    const { error: delErr } = await supabase.from('shipments').delete().gte('id', 0);
    if (delErr) throw delErr;

    const { error: insErr } = await supabase.from('shipments').insert(rows);
    if (insErr) throw insErr;

    await supabase.from('sync_log').insert({ rows_count: rows.length });

    console.log(`[sync] ✅ ${rows.length} rows — ${new Date().toISOString()}`);
    return res.status(200).json({ success: true, rows: rows.length });

  } catch (err) {
    console.error('[sync] ❌', err.message);
    return res.status(500).json({ error: err.message });
  }
};
