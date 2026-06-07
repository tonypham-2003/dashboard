# Hướng Dẫn Deploy T&C Dashboard — Real-time Edition

## Kiến trúc Real-time

```
Người dùng sửa Google Sheet
         ↓
onChange trigger → onSheetChange() stamp timestamp (< 1 giây)
         ↓
Dashboard poll getLastModified() mỗi 5 giây (rất nhẹ — không đọc Sheet)
         ↓ (khi timestamp thay đổi)
Dashboard gọi getShipmentData() → cập nhật UI trong vòng ~5 giây
```

---

## Bước 1 — Tạo Apps Script Project

### Cách A (Khuyến nghị): Từ Google Sheet
1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/1yZjvoIynV9NejrE4mBHW_niRKTqD1UCP41VcyqbbfvY
2. Menu **Extensions** → **Apps Script**
3. Apps Script tự có quyền đọc Sheet — không cần cấp thêm permission

### Cách B: Standalone project
1. Truy cập https://script.google.com → **New project**

---

## Bước 2 — Tạo 3 Files

| File | Loại | Nội dung |
|------|------|---------|
| `Code.gs` | Script | Entry point + `setupTrigger()` |
| `DataService.gs` | Script | `onSheetChange()` + `getLastModified()` + `getShipmentData()` |
| `index.html` | HTML | React dashboard UI |

**Cách tạo:**
- `Code.gs`: Đã có sẵn → xoá hết → paste nội dung từ file `Code.gs`
- `DataService.gs`: Click **+** → **Script** → đặt tên `DataService` → paste
- `index.html`: Click **+** → **HTML** → đặt tên `index` → paste

Đặt tên project: **T&C Dashboard** → **Ctrl+S**

---

## Bước 3 — Deploy Web App

1. Click **Deploy** → **New deployment**
2. Click ⚙️ cạnh "Select type" → chọn **Web app**
3. Cấu hình:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (hoặc `Anyone within [tên tổ chức]`)
4. Click **Deploy** → **Authorize** → Allow
5. Copy **Web app URL**

---

## Bước 4 — Kích Hoạt Real-time (BẮT BUỘC)

> Bước này cài đặt trigger để dashboard tự động phát hiện thay đổi trong Sheet.

1. Trong Apps Script editor, click **▶ Run** ở thanh toolbar
2. Chọn function: **`setupTrigger`**
3. Lần đầu sẽ hỏi quyền → **Review permissions** → Allow
4. Kiểm tra log: thấy `✅ Real-time trigger installed` = thành công

**Xác nhận trigger đã được cài:**
- Click **Triggers** (biểu tượng đồng hồ ⏰ bên trái)
- Phải thấy: `onSheetChange` | `From spreadsheet` | `On change`

---

## Bước 5 — Mở Dashboard

Dán Web app URL vào trình duyệt. Sau khoảng 10 giây:
- Topbar hiển thị badge **● LIVE** màu xanh
- Sidebar hiển thị `Live · HH:MM`
- Khi sửa Sheet → dashboard cập nhật trong vòng **5 giây** + toast thông báo

---

## Bước 6 — Redeploy Khi Sửa Code

> **Trigger KHÔNG cần chạy lại** — nó tồn tại vĩnh viễn cho đến khi xoá thủ công.

Chỉ cần redeploy khi sửa `Code.gs`, `DataService.gs`, hoặc `index.html`:

1. **Deploy** → **Manage deployments**
2. Click ✏️ cạnh deployment hiện tại
3. **Version**: chọn **New version** → **Deploy**

---

## Bước 7 — Chia sẻ

Copy URL (bước 3) gửi cho BOD và khách hàng qua email/portal.

Mỗi người truy cập URL sẽ thấy dashboard real-time với badge **LIVE**.

---

## Troubleshooting

| Triệu chứng | Nguyên nhân | Cách fix |
|-------------|------------|---------|
| Badge LIVE không xuất hiện | `setupTrigger()` chưa chạy | Chạy `setupTrigger` từ Apps Script editor |
| Dữ liệu không tự cập nhật | Trigger bị xoá hoặc lỗi | Kiểm tra Triggers tab, chạy lại `setupTrigger` |
| Dashboard trắng | CDN bị chặn | Unblock `unpkg.com`, `cdn.jsdelivr.net`, `fonts.googleapis.com` |
| `Exception: You do not have permission` | Sai Google Account | Dùng account có quyền truy cập Sheet |
| Trigger báo lỗi trong Executions | Apps Script quota | Free tier: 20 trigger/ngày, đủ cho mọi use case này |

---

## Cấu Trúc Files

```
Apps Script Project: T&C Dashboard
├── Code.gs          ← doGet() + setupTrigger()
├── DataService.gs   ← onSheetChange() + getLastModified() + getShipmentData()
└── index.html       ← React 18 + Chart.js dashboard (real-time)
```
