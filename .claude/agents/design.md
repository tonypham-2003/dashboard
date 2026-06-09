# Agent: design
Phụ trách UI, giao diện, style, biểu đồ, bảng — chỉ edit `index.html`.
Không chạm `api/sync.js`, `Code.gs`, Supabase, Vercel config.

---

## CSS Variables
```
--nh:58px  --bg:#090a18  --surface:#11132a  --surface2:#191b38
--border:rgba(139,92,246,.15)  --accent:#7c3aed
--dark:#ece8ff  --muted:#7b7fa8
g-purple: linear-gradient(135deg,#bc8cff,#8957e5)
```

## Layout
```
topnav (fixed 58px) → .tn-logo | .tn-nav | .tn-right
.main (margin-top:58px)
  ├─ dashboard: .kpi-panels (8 cards) + .cr2 grid (grid-auto-rows:320px)
  └─ shipments: table + filter/search/pagination
```

## KPI Cards
- `.km-ico g-purple` — `.km-ico svg { fill:white; stroke:none }`
- 8 icons: `IBox` `IAnchor` `ITruck` `ICheckCircle` `IDoc` `IBell` `ITime` `IShield`
- Icon dùng `fillRule="evenodd"` để tạo cutout bên trong
- On-Time và Declaration Accuracy KHÔNG có "/1000"

## Charts (Chart.js 4.4)
| Component | Loại | Toggle |
|-----------|------|--------|
| BarVol | Bar — Container Volume | Month/Quarter/Year |
| BarAcc | Bar — Declaration Accuracy | Month/Quarter/Year |
| LineOT | Line — On-Time Delivery | monthly |
| DoughnutLine | Doughnut — Customs Line | — |
| DoughnutPort | Doughnut — Port | — |

Toggle: `border-radius:2rem`, active=`var(--accent)` + white text, inactive=transparent.

## Shipments Table
- Sort giảm dần: `parseInt(b.no) - parseInt(a.no)` — dòng mới nhất lên đầu
- Tất cả td text: `color:var(--dark)` — không dùng `var(--muted)` hay `monospace` cho data
- Badge: Correct/Yes/Green → `bg-green` | Incorrect/No/Red → `bg-red` | Yellow → `bg-yellow`
