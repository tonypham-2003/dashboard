import Papa from 'papaparse'

const SHEET_ID = '1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

export function mapRow(row) {
  return {
    no:                     row[0] ?? '',
    poNo:                   row[1] ?? '',
    invoiceNo:              row[2] ?? '',
    containerNo:            row[3] ?? '',
    blNo:                   row[4] ?? '',
    destinationPort:        row[5] ?? '',
    plant:                  row[6] ?? '',
    docRecDate:             row[7] ?? '',
    eta:                    row[8] ?? '',
    ata:                    row[9] ?? '',
    cusDecDate:             row[10] ?? '',
    declarationStatus:      row[11] ?? '',
    customsLine:            row[12] ?? '',
    taxPayDate:             row[13] ?? '',
    completedCusInspection: row[14] ?? '',
    customsClearanceDate:   row[15] ?? '',
    truckPlate:             row[16] ?? '',
    driverTelephone:        row[17] ?? '',
    pickupAtPort:           row[18] ?? '',
    deliverToPlant:         row[19] ?? '',
    customerComplaint:      row[20] ?? '',
  }
}

export async function fetchShipments() {
  // Add cache-busting so we always get fresh data
  const url = `${CSV_URL}&t=${Date.now()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`)
  const text = await res.text()

  const { data } = Papa.parse(text, { skipEmptyLines: true })
  // data[0] = headers, data[1+] = rows
  return data.slice(1).map(mapRow)
}
