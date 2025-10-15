-- Migration: Create voucher_online_settings table for admin hotspot settings
-- Date: 2025-01-27
-- Description: Create table for storing voucher online settings (profile mapping and enable/disable)

CREATE TABLE IF NOT EXISTS voucher_online_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    profile TEXT NOT NULL,
    digits INTEGER NOT NULL DEFAULT 5,
    enabled INTEGER NOT NULL DEFAULT 1,
    agent_price DECIMAL(10,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings for all packages
INSERT OR IGNORE INTO voucher_online_settings (package_id, name, profile, digits, enabled) VALUES
('3k', '3rb - 1 Hari', 'default', 5, 1),
('5k', '5rb - 2 Hari', 'default', 5, 1),
('10k', '10rb - 5 Hari', 'default', 5, 1),
('15k', '15rb - 8 Hari', 'default', 5, 1),
('25k', '25rb - 15 Hari', 'default', 5, 1),
('50k', '50rb - 30 Hari', 'default', 5, 1);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_voucher_online_settings_package ON voucher_online_settings(package_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_voucher_online_settings_updated_at
    AFTER UPDATE ON voucher_online_settings
    FOR EACH ROW
BEGIN
    UPDATE voucher_online_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
