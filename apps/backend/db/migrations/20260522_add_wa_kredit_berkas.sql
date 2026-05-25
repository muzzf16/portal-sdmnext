-- ====================================================
-- Migration: WhatsApp Notification for Kredit Berkas
-- Tambah kolom no_wa_nasabah + tabel log notifikasi WA
-- ====================================================

-- Tambah kolom nomor WhatsApp nasabah ke tabel kredit_berkas
ALTER TABLE kredit_berkas ADD COLUMN no_wa_nasabah TEXT;

-- Log pengiriman notifikasi WhatsApp untuk audit trail
CREATE TABLE IF NOT EXISTS wa_notification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    berkas_id INTEGER NOT NULL,
    no_wa TEXT NOT NULL,
    nama_nasabah TEXT,
    trigger_stage TEXT NOT NULL,                  -- penerimaan | delegasi_survey | approval_keputusan | ditolak
    message_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',       -- pending | sent | failed | retry
    provider_response TEXT,                       -- JSON response dari WA Gateway
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (berkas_id) REFERENCES kredit_berkas(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_wa_notification_log_berkas ON wa_notification_log(berkas_id);
CREATE INDEX IF NOT EXISTS idx_wa_notification_log_status ON wa_notification_log(status);
