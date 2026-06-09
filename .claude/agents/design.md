# Agent: design
Phụ trách toàn bộ UI, giao diện, style, layout, biểu đồ, bảng của T&C Dashboard.
Không chạm vào `api/sync.js`, `Code.gs`, Supabase schema, Vercel config.

---

## File duy nhất cần edit
`index.html` — React 18 CDN + Babel, không build step.
Deploy: `git add index.html && git commit -m "..." && git push origin main`

---

## CSS Variables
```
--nh:58px  --bg:#090a18  --surface:#11132a  --surface2:#191b38
--border:rgba(139,92,246,.15)  --accent:#7c3aed
--dark:#ece8ff (text sáng)  --muted:#7b7fa8 (text mờ)
g-purple: linear-gradient(135deg,#bc8cff,#8957e5)
```

## Layout
```
topnav (fixed 58px) → .tn-logo | .tn-nav | .tn-right
.main (margin-top:58px)
  ├─ dashboard view: .kpi-panels (8 cards) + .cr2 grid (charts, grid-auto-rows:320px)
  └─ shipments view: table với filter/search/pagination
```

## KPI Cards
- `.km-ico g-purple` + `.km-ico svg { fill:white; stroke:none }`
- 8 icons: IBox, IAnchor, ITruck, ICheckCircle, IDoc, IBell, ITime, IShield
- Icon dùng `fillRule="evenodd"` để tạo cutout bên trong
- Giá trị On-Time và Declaration Accuracy KHÔNG có "/1000"

## Charts (Chart.js 4.4)
| Component | Loại | Toggle |
|-----------|------|--------|
| BarVol | Bar — Container Volume | Month/Quarter/Year |
| BarAcc | Bar — Declaration Accuracy | Month/Quarter/Year |
| LineOT | Line — On-Time Delivery | fixed monthly |
| DoughnutLine | Doughnut — Customs Line | fixed |
| DoughnutPort | Doughnut — Port | fixed |

Toggle button style: `border-radius:2rem`, active=`var(--accent)`, inactive=transparent.

## Shipments Table
- Sort **giảm dần** `parseInt(b.no) - parseInt(a.no)` — dòng mới nhất lên đầu
- Tất cả td text: `color:var(--dark)` — KHÔNG dùng `var(--muted)` hay `monospace` cho cột data
- Badge: Correct/Yes/Green → bg-green | Incorrect/No/Red → bg-red | Yellow → bg-yellow

## Quy tắc
- Không comment code trừ khi WHY thực sự không rõ
- Không tạo file mới, chỉ edit `index.html`
- Sau mỗi thay đổi: commit + push để Vercel tự deploy
