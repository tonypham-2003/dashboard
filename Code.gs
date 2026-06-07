/**
 * T&C Dashboard — Apps Script → Supabase trực tiếp
 * Khi Sheet thay đổi → đọc data → POST lên Supabase REST API
 *
 * SETUP (chạy 1 lần):
 *   1. Apps Script → Project Settings → Script Properties
 *      Thêm: SUPABASE_KEY = <service role key của bạn>
 *   2. Chạy hàm setupTrigger() một lần
 */

var SUPABASE_URL = 'https://shuiloynbgpazmipcxkz.supabase.co';

var COLS = [
  'no','po_no','invoice_no','container_no','bl_no','destination_port','plant',
  'doc_rec_date','eta','ata','cus_dec_date','declaration_status','customs_line',
  'tax_pay_date','completed_cus_inspection','customs_clearance_date',
  'truck_plate','driver_telephone','pickup_at_port','deliver_to_plant','customer_complaint'
];

function getKey() {
  return PropertiesService.getScriptProperties().getProperty('SUPABASE_KEY');
}

function onSheetChange(e) { syncNow(); }

function syncNow() {
  try {
    var key = getKey();
    if (!key) { Logger.log('❌ Chưa set SUPABASE_KEY trong Script Properties'); return; }

    var sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) { Logger.log('Sheet trống.'); return; }

    var raw  = sheet.getRange(2, 1, lastRow - 1, 21).getValues();
    var rows = raw
      .filter(function(r) { return r[0] !== '' && r[0] !== null; })
      .map(function(r) {
        var obj = {};
        COLS.forEach(function(col, i) { obj[col] = String(r[i] == null ? '' : r[i]).trim(); });
        return obj;
      });

    var headers = {
      'Authorization': 'Bearer ' + key,
      'apikey':        key,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal'
    };

    // Xóa hết data cũ
    UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/shipments?id=gte.0', {
      method: 'delete', headers: headers, muteHttpExceptions: true
    });

    // Insert data mới (batch 50)
    for (var i = 0; i < rows.length; i += 50) {
      var batch = rows.slice(i, i + 50);
      var res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/shipments', {
        method: 'post', headers: headers,
        payload: JSON.stringify(batch), muteHttpExceptions: true
      });
      if (res.getResponseCode() >= 400) {
        Logger.log('Insert lỗi: ' + res.getContentText());
      }
    }

    // Trigger Supabase Realtime → dashboard tự cập nhật
    UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/sync_log', {
      method: 'post', headers: headers,
      payload: JSON.stringify({ rows_count: rows.length }), muteHttpExceptions: true
    });

    Logger.log('✅ Synced ' + rows.length + ' rows → Supabase');

  } catch (err) {
    Logger.log('❌ Sync lỗi: ' + err.message);
  }
}

function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'onSheetChange') ScriptApp.deleteTrigger(t);
  });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onSheetChange').forSpreadsheet(ss).onChange().create();
  Logger.log('✅ Trigger đã cài.');
}

function manualSync() { syncNow(); }
