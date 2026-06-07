-- ═══════════════════════════════════════════════
-- T&C Dashboard — Supabase Schema
-- Chạy file này trong Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Bảng chứa toàn bộ dữ liệu lô hàng
CREATE TABLE IF NOT EXISTS shipments (
  id                      SERIAL PRIMARY KEY,
  no                      TEXT,
  po_no                   TEXT,
  invoice_no              TEXT,
  container_no            TEXT,
  bl_no                   TEXT,
  destination_port        TEXT,
  plant                   TEXT,
  doc_rec_date            TEXT,
  eta                     TEXT,
  ata                     TEXT,
  cus_dec_date            TEXT,
  declaration_status      TEXT,
  customs_line            TEXT,
  tax_pay_date            TEXT,
  completed_cus_inspection TEXT,
  customs_clearance_date  TEXT,
  truck_plate             TEXT,
  driver_telephone        TEXT,
  pickup_at_port          TEXT,
  deliver_to_plant        TEXT,
  customer_complaint      TEXT,
  synced_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng trigger realtime (1 row mỗi lần sync xong)
CREATE TABLE IF NOT EXISTS sync_log (
  id         SERIAL PRIMARY KEY,
  synced_at  TIMESTAMPTZ DEFAULT NOW(),
  rows_count INTEGER
);

-- 3. Row Level Security — cho phép đọc không cần đăng nhập
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "public read sync_log"  ON sync_log  FOR SELECT USING (true);

-- 4. Bật Realtime cho sync_log (dùng để trigger dashboard update)
ALTER TABLE sync_log REPLICA IDENTITY FULL;

-- 5. Index để query nhanh
CREATE INDEX IF NOT EXISTS idx_shipments_no   ON shipments(no);
CREATE INDEX IF NOT EXISTS idx_shipments_port ON shipments(destination_port);
CREATE INDEX IF NOT EXISTS idx_shipments_line ON shipments(customs_line);
