# T&C Dashboard — Trucking & Customs Shipment Tracker

## Project Overview

A web dashboard for DP World to monitor trucking and customs activities for import shipments across multiple customers, ports, and plants. Two audiences:
- **BOD**: full visibility across all shipments, all customers, all KPIs
- **Customers**: filtered view showing only their own shipments and status

The dashboard connects live to a Google Sheets file and auto-refreshes when data changes.

---

## Data Source

**Google Sheets ID**: `1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY`
**Sheet**: Sheet1 (gid=0)
**Access**: Google Sheets API v4, public read via API key (no OAuth needed if sheet is "Anyone with link can view")
**Polling interval**: Refresh data every 5 minutes via `setInterval`

### Column Schema (row 1 = headers, row 2+ = data)

| Column | Field Name | Type | Notes |
|--------|-----------|------|-------|
| A | No. | number | Row index |
| B | PO No | string | e.g. `PO2026000001` |
| C | Invoice No | string | e.g. `INV2026000001` |
| D | Container No | string | e.g. `TCKU9310477` |
| E | BL No | string | e.g. `BL2026624103` |
| F | Destination Port | string | Cat Lai Port / Cai Mep Port / Da Nang Port / Hai Phong Port / Lach Huyen Port |
| G | Plant | string | HCMC Plant / Hanoi Plant / Bac Ninh Plant / Dong Nai Plant / Binh Duong Plant / Da Nang Plant / Hai Phong Plant |
| H | Doc Rec Date | string | Format: `HH:mm - DD Mon` e.g. `09:15 - 08 Jun` |
| I | ETA | string | Same format |
| J | ATA | string | Same format (Actual Time of Arrival) |
| K | Cus Dec Date | string | Customs Declaration Date |
| L | Declaration Status | string | `Correct` or `Incorrect` |
| M | Customs Line | string | `Green` / `Yellow` / `Red` |
| N | Tax Pay Date | string | Same date format |
| O | Completed Cus Inspection | string | Same date format |
| P | Customs Clearance Date | string | Same date format |
| Q | Truck Plate | string | e.g. `51D-204.24` |
| R | Driver's Telephone | string | e.g. `0350273018` |
| S | Have Container Pick Up At Port? | string | `Yes` / `No` |
| T | Have Container Deliver To Plant? | string | `Yes` / `No` |
| U | Customer Complaint | string | `No Complaint` / `Late Delivery` / other |

### Known Reference Data
- **Ports**: Cat Lai Port, Cai Mep Port, Da Nang Port, Hai Phong Port, Lach Huyen Port
- **Plants**: HCMC Plant, Hanoi Plant, Bac Ninh Plant, Dong Nai Plant, Binh Duong Plant, Da Nang Plant, Hai Phong Plant
- **Customs Line colors**: Green (standard clearance), Yellow (document inspection), Red (physical inspection — longest delay)
- **Complaints observed**: "No Complaint" (majority), "Late Delivery"

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Data fetching | Google Sheets API v4 (REST, fetch) |
| Icons | Heroicons v2 |
| Table | TanStack Table v8 |
| State | React Context + useState/useEffect |
| Routing | React Router v6 |
| Deployment | Static (can be served from any CDN/Nginx) |

No backend. All data comes directly from Google Sheets API using a public API key.

---

## Design System — Soft UI Dashboard Style

Inspired by [Soft UI Dashboard React by Creative Tim](https://demos.creative-tim.com/soft-ui-dashboard-react/).

### Core Design Tokens

```css
/* Colors */
--color-primary:     #344767;   /* dark blue-gray — headings, sidebar text */
--color-dark:        #252f40;   /* sidebar background gradient start */
--color-darker:      #1a1a2e;   /* sidebar background gradient end */
--color-info:        #1A73E8;   /* blue — info cards */
--color-success:     #82d616;   /* green — success states */
--color-warning:     #f53939;   /* orange — warning */
--color-danger:      #ea0606;   /* red — danger/error */
--color-bg:          #f8f9fa;   /* page background */
--color-white:       #ffffff;
--color-card-shadow: 0 20px 27px 0 rgba(0,0,0,0.05);

/* Gradient cards */
--gradient-dark:     linear-gradient(310deg, #141727, #3A416F);
--gradient-info:     linear-gradient(310deg, #2152ff, #21d4fd);
--gradient-success:  linear-gradient(310deg, #17ad37, #98ec2d);
--gradient-warning:  linear-gradient(310deg, #f53939, #fbcf33);

/* Border radius */
--radius-card:  1rem;       /* 16px — all cards */
--radius-btn:   0.5rem;     /* 8px — buttons */
--radius-badge: 0.375rem;   /* 6px — status badges */

/* Typography */
--font-family:  'Plus Jakarta Sans', sans-serif;
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.25rem;
--font-size-xl: 1.5rem;
--font-size-2xl: 2rem;
```

### Layout Structure

```
┌────────────────────────────────────────────────────────┐
│  SIDEBAR (260px fixed)      │  MAIN CONTENT            │
│  ┌──────────────────────┐   │  ┌────────────────────┐  │
│  │ Logo + Brand         │   │  │ Top Navbar          │  │
│  ├──────────────────────┤   │  ├────────────────────┤  │
│  │ Nav Links:           │   │  │                    │  │
│  │ • Dashboard          │   │  │  KPI Cards (row)   │  │
│  │ • Shipments          │   │  │                    │  │
│  │ • Customs Status     │   │  ├──────────────────  │  │
│  │ • Trucking           │   │  │ Charts row:        │  │
│  │ • Reports            │   │  │  Bar Chart | Donut │  │
│  ├──────────────────────┤   │  ├────────────────────┤  │
│  │ Filter by Customer   │   │  │ Shipments Table    │  │
│  └──────────────────────┘   │  └────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Sidebar
- Background: `linear-gradient(195deg, #42424a, #191919)` (dark gradient)
- Text: white
- Active nav item: white pill/rounded highlight with slight transparency
- Logo area: white text, small logo or icon
- Width: 260px, fixed on desktop; collapsible on mobile
- Bottom: "DP World © 2026" footer text

### Navbar (top bar)
- White background, soft shadow
- Breadcrumb path (e.g., Dashboard > Overview)
- Right side: last updated timestamp + manual refresh button

### KPI Summary Cards (top row, 4 cards)

Each card has:
- Gradient icon box (left-aligned, floats above card top edge slightly)
- Title (small, gray)
- Value (large, bold)
- Trend or sub-label

The 4 cards:
1. **Total Shipments** — gradient dark — count of all rows
2. **Customs Cleared** — gradient success (green) — count where Customs Clearance Date is filled
3. **Red Channel** — gradient warning (red-orange) — count where Customs Line = Red
4. **Complaints** — gradient info (blue) — count where Customer Complaint ≠ "No Complaint"

### Charts Row (below KPI cards, 2 columns)

**Left (60% width) — Bar Chart: Shipments by Destination Port**
- X-axis: port names (abbreviated)
- Y-axis: count
- White card, soft shadow, border-radius 1rem
- Bar color: `#1A73E8` with slight transparency

**Right (40% width) — Donut Chart: Customs Line Distribution**
- Segments: Green / Yellow / Red
- Colors: `#82d616` / `#fbcf33` / `#ea0606`
- Center label: total shipments
- Legend below chart

### Secondary Charts Row (optional, below first charts)

**Left (50%) — Horizontal Bar: Shipments by Plant**
**Right (50%) — Line Chart: Monthly shipment trend** (group by ETA month)

### Shipments Data Table

Full-width card below charts.

Features:
- Global search input (filter across PO No, Invoice No, Container No, BL No)
- Column filters: Destination Port, Plant, Declaration Status, Customs Line, Complaint
- Sortable columns (click header)
- Pagination (20 rows/page)
- Color-coded Customs Line badge: Green/Yellow/Red pill
- Color-coded Declaration Status badge: Correct (green) / Incorrect (red)
- Pick Up / Deliver columns shown as checkmarks or X icons
- Complaint column: highlight in orange/red if not "No Complaint"
- Row click: expand inline or open slide-over panel with full shipment detail

#### Table Column Order
No. | PO No | Container No | BL No | Port | Plant | ETA | ATA | Cus Dec | Dec. Status | Customs Line | Clearance Date | Pickup | Deliver | Complaint

---

## Pages / Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard Overview | KPI cards + charts + recent shipments table |
| `/shipments` | All Shipments | Full table with all filters |
| `/customs` | Customs Status | Focus on customs pipeline: declaration → inspection → clearance |
| `/trucking` | Trucking | Focus on truck plate, driver info, port pickup, plant delivery |

> For MVP, single-page dashboard (`/`) is sufficient. Other routes can be empty stubs.

---

## Google Sheets API Integration

### Fetch function

```js
const SHEET_ID = '1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY';
const API_KEY  = process.env.VITE_GOOGLE_API_KEY;
const RANGE    = 'Sheet1!A2:U';   // skip header row

async function fetchShipments() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  return json.values; // array of rows (each row = array of cell strings)
}
```

### Row → Object mapping

```js
function mapRow(row) {
  return {
    no:               row[0],
    poNo:             row[1],
    invoiceNo:        row[2],
    containerNo:      row[3],
    blNo:             row[4],
    destinationPort:  row[5],
    plant:            row[6],
    docRecDate:       row[7],
    eta:              row[8],
    ata:              row[9],
    cusDecDate:       row[10],
    declarationStatus:row[11],  // 'Correct' | 'Incorrect'
    customsLine:      row[12],  // 'Green' | 'Yellow' | 'Red'
    taxPayDate:       row[13],
    completedCusInspection: row[14],
    customsClearanceDate:   row[15],
    truckPlate:       row[16],
    driverTelephone:  row[17],
    pickupAtPort:     row[18],  // 'Yes' | 'No'
    deliverToPlant:   row[19],  // 'Yes' | 'No'
    customerComplaint:row[20],
  };
}
```

### Auto-refresh

```js
useEffect(() => {
  loadData();
  const interval = setInterval(loadData, 5 * 60 * 1000); // 5 min
  return () => clearInterval(interval);
}, []);
```

Display "Last updated: HH:mm:ss" in the navbar.

---

## Environment Variables

```env
VITE_GOOGLE_API_KEY=your_google_sheets_api_key_here
VITE_SHEET_ID=1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY
```

Store in `.env.local` (gitignored). The Google Sheets must be shared as "Anyone with the link can view" for the API key to work without OAuth.

---

## File Structure

```
t-c-dashboard/
├── public/
│   └── dp-world-logo.svg
├── src/
│   ├── api/
│   │   └── sheets.js          # fetchShipments(), mapRow()
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── cards/
│   │   │   └── KpiCard.jsx     # gradient stat card
│   │   ├── charts/
│   │   │   ├── PortBarChart.jsx
│   │   │   ├── CustomsLineDonut.jsx
│   │   │   └── PlantBarChart.jsx
│   │   ├── table/
│   │   │   ├── ShipmentsTable.jsx
│   │   │   ├── TableFilters.jsx
│   │   │   └── ShipmentDetail.jsx  # slide-over / modal
│   │   └── ui/
│   │       ├── Badge.jsx       # Green/Yellow/Red/Correct/Incorrect
│   │       ├── Spinner.jsx
│   │       └── RefreshButton.jsx
│   ├── context/
│   │   └── ShipmentsContext.jsx  # data, loading, error, lastUpdated
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Shipments.jsx
│   │   ├── Customs.jsx
│   │   └── Trucking.jsx
│   ├── hooks/
│   │   └── useShipments.js
│   ├── utils/
│   │   └── formatDate.js       # parse "HH:mm - DD Mon" strings
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # Tailwind base + custom CSS vars
├── .env.local
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## KPI Card Definitions

| Card | Value | Gradient | Icon |
|------|-------|----------|------|
| Total Shipments | `shipments.length` | dark (#141727 → #3A416F) | Cube/Box |
| Customs Cleared | `shipments.filter(s => s.customsClearanceDate).length` | success green | CheckCircle |
| Red Channel | `shipments.filter(s => s.customsLine === 'Red').length` | danger red-orange | ExclamationTriangle |
| With Complaints | `shipments.filter(s => s.customerComplaint !== 'No Complaint').length` | info blue | ChatBubble |

---

## Badge Component Spec

```jsx
// Customs Line badge
<Badge variant="green" />   // bg: #d4edda, text: #155724
<Badge variant="yellow" />  // bg: #fff3cd, text: #856404
<Badge variant="red" />     // bg: #f8d7da, text: #721c24

// Declaration Status badge
<Badge variant="correct" />   // same as green
<Badge variant="incorrect" /> // same as red
```

---

## Responsive Behavior

- **Desktop (≥1280px)**: sidebar visible, full layout
- **Tablet (768–1279px)**: sidebar collapses to icon-only strip
- **Mobile (<768px)**: sidebar hidden, hamburger menu opens overlay drawer

---

## Accessibility & UX Notes

- Color-coded customs line must also use text label (not color alone) for accessibility
- Table rows are keyboard-navigable
- Loading state: skeleton cards (not spinner on first load)
- Empty state: "No shipments found" illustration when filters return 0 results
- Error state: "Could not load data. Check your connection." with retry button

---

## MVP Scope (build this first)

1. `src/api/sheets.js` — fetch + map data from Google Sheets
2. `ShipmentsContext.jsx` — context with auto-refresh
3. `Layout.jsx` + `Sidebar.jsx` + `Navbar.jsx` — shell
4. 4x `KpiCard.jsx` on Dashboard
5. `PortBarChart.jsx` + `CustomsLineDonut.jsx`
6. `ShipmentsTable.jsx` with search + filter + pagination
7. `.env.local` with API key

Out of scope for MVP: authentication, role-based filtering, slide-over detail panel, export to Excel.
