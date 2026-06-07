/**
 * T&C Dashboard — Apps Script
 *
 * Flow: Sheet thay đổi → đọc data trực tiếp → POST lên Vercel /api/sync
 *       Không dùng Google Sheets API, không cần API key.
 *
 * SETUP (chạy 1 lần):
 *   1. Điền VERCEL_SYNC_URL và SYNC_SECRET bên dưới
 *   2. Extensions → Apps Script → Run → setupTrigger
 */

var VERCEL_SYNC_URL = 'https://YOUR-PROJECT.vercel.app/api/sync';
var SYNC_SECRET     = 'YOUR_SYNC_SECRET';  // phải khớp với Vercel env var

var COLS = [
  'no','po_no','invoice_no','container_no','bl_no','destination_port','plant',
  'doc_rec_date','eta','ata','cus_dec_date','declaration_status','customs_line',
  'tax_pay_date','completed_cus_inspection','customs_clearance_date',
  'truck_plate','driver_telephone','pickup_at_port','deliver_to_plant','customer_complaint'
];

/* ── Trigger: tự động gọi khi Sheet thay đổi ── */
function onSheetChange(e) {
  syncNow();
}

/* ── Đọc sheet → POST lên Vercel ── */
function syncNow() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('Sheet trống, bỏ qua sync.');
      return;
    }

    var raw = sheet.getRange(2, 1, lastRow - 1, 21).getValues();

    var rows = raw
      .filter(function(r) { return r[0] !== '' && r[0] !== null && r[0] !== undefined; })
      .map(function(r) {
        var obj = {};
        COLS.forEach(function(col, i) {
          obj[col] = String(r[i] == null ? '' : r[i]).trim();
        });
        return obj;
      });

    var payload = JSON.stringify({ secret: SYNC_SECRET, rows: rows });

    var response = UrlFetchApp.fetch(VERCEL_SYNC_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: payload,
      muteHttpExceptions: true
    });

    Logger.log('Sync ' + rows.length + ' rows → ' + response.getResponseCode()
      + ': ' + response.getContentText().substring(0, 200));

  } catch (err) {
    Logger.log('Sync lỗi: ' + err.message);
  }
}

/* ── Cài trigger onChange (chạy 1 lần) ── */
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'onSheetChange') ScriptApp.deleteTrigger(t);
  });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onSheetChange').forSpreadsheet(ss).onChange().create();
  Logger.log('✅ Trigger đã cài. Dashboard cập nhật trong < 2 giây khi Sheet thay đổi.');
}

/* ── Sync thủ công để test ── */
function manualSync() {
  syncNow();
}
