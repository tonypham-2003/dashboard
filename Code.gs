/**
 * T&C Dashboard — Apps Script → Vercel → Supabase
 * Sheet thay đổi → đọc data → POST lên Vercel /api/sync
 *
 * SETUP (chạy 1 lần): Extensions → Apps Script → chọn setupTrigger → Run
 */

var VERCEL_SYNC_URL = 'https://dashboard-red-mu-51.vercel.app/api/sync';
var SYNC_SECRET     = 'tc2026secret';

var COLS = [
  'no','po_no','invoice_no','container_no','bl_no','cus_dec_no','destination_port','plant',
  'doc_rec_date','eta','ata','cus_dec_date','declaration_status','customs_line',
  'tax_pay_date','completed_cus_inspection','customs_clearance_date',
  'truck_plate','driver_telephone','pickup_at_port','deliver_to_plant','customer_complaint'
];

function onSheetChange(e) { syncNow(); }

function syncNow() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) { Logger.log('⚠ Sync đang chạy, bỏ qua.'); return; }
  try {
    var ss      = SpreadsheetApp.getActiveSpreadsheet();
    var sheet   = ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    Logger.log('Sheet: ' + sheet.getName() + ' | lastRow: ' + lastRow + ' | SS: ' + ss.getName());
    if (lastRow < 2) { Logger.log('Sheet trống.'); return; }

    var raw  = sheet.getRange(3, 2, lastRow - 2, 22).getValues();
    var rows = raw
      .filter(function(r) { return r[1] !== '' && r[1] !== null && r[1] !== undefined; })
      .map(function(r) {
        var obj = {};
        COLS.forEach(function(col, i) {
          obj[col] = String(r[i] == null ? '' : r[i]).trim();
        });
        return obj;
      });

    var response = UrlFetchApp.fetch(VERCEL_SYNC_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ secret: SYNC_SECRET, rows: rows }),
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body = response.getContentText().substring(0, 300);
    Logger.log('Sync ' + rows.length + ' rows → HTTP ' + code + ': ' + body);

    if (code !== 200) Logger.log('❌ Lỗi: ' + body);
    else Logger.log('✅ Thành công');

  } catch (err) {
    Logger.log('❌ Sync lỗi: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'onSheetChange') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onSheetChange')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onChange()
    .create();
  Logger.log('✅ Trigger đã cài.');
}

function manualSync() { syncNow(); }

function doGet(e) {
  syncNow();
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
