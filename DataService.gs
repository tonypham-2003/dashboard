/**
 * T&C Dashboard — Data Service
 * ─────────────────────────────────────────────
 * Real-time architecture:
 *   1. onChange trigger fires onSheetChange() whenever Sheet data changes
 *   2. onSheetChange() stamps ISO timestamp in ScriptProperties
 *   3. Client polls getLastModified() every 5 seconds (very lightweight — no Sheet read)
 *   4. When timestamp changes, client calls getShipmentData() to fetch full data
 *
 * Column order (0-indexed, returned as string[][]):
 *   0:no  1:poNo  2:invoiceNo  3:containerNo  4:blNo  5:destinationPort  6:plant
 *   7:docRecDate  8:eta  9:ata  10:cusDecDate  11:declarationStatus  12:customsLine
 *   13:taxPayDate  14:completedCusInspection  15:customsClearanceDate
 *   16:truckPlate  17:driverTelephone  18:pickupAtPort  19:deliverToPlant  20:customerComplaint
 */

var SPREADSHEET_ID = '1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY';
var PROP_LAST_MOD  = 'tc_dashboard_lastModified';

/* ── REAL-TIME TRIGGER HANDLER ────────────────────────────────────────── */

/**
 * Called automatically by the Apps Script onChange trigger
 * whenever anything changes in the spreadsheet (edit, insert row, etc.).
 * Only stamps a timestamp — does NOT read Sheet data (fast).
 */
function onSheetChange(e) {
  PropertiesService.getScriptProperties()
    .setProperty(PROP_LAST_MOD, new Date().toISOString());
}

/* ── HEARTBEAT (lightweight) ──────────────────────────────────────────── */

/**
 * Returns the ISO timestamp of the last Sheet change.
 * Called by client every 5 seconds. Does NOT read Sheet data.
 * Returns new Date(0).toISOString() if trigger hasn't fired yet.
 */
function getLastModified() {
  return PropertiesService.getScriptProperties()
    .getProperty(PROP_LAST_MOD) || new Date(0).toISOString();
}

/* ── FULL DATA FETCH ──────────────────────────────────────────────────── */

/**
 * Returns { data: string[][], lastUpdated: ISO, rowCount: number }
 * Only called when getLastModified() returns a new timestamp.
 */
function getShipmentData() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    var last  = sheet.getLastRow();

    if (last < 2) {
      return { data: [], lastUpdated: new Date().toISOString(), rowCount: 0 };
    }

    var raw  = sheet.getRange(2, 1, last - 1, 21).getValues();
    var data = raw
      .filter(function(r) { return r[0] !== '' && r[0] !== null && r[0] !== undefined; })
      .map(function(r) {
        return r.map(function(cell) { return String(cell == null ? '' : cell); });
      });

    var now = new Date().toISOString();

    // Keep timestamp in sync so heartbeat matches after full fetch
    PropertiesService.getScriptProperties().setProperty(PROP_LAST_MOD, now);

    return { data: data, lastUpdated: now, rowCount: data.length };

  } catch (e) {
    Logger.log('getShipmentData error: ' + e.message);
    return {
      data: [],
      error: e.message,
      lastUpdated: new Date().toISOString(),
      rowCount: 0
    };
  }
}
