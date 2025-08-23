-- Database Migration untuk CRM Booking System
-- Pastikan struktur tabel yang benar untuk integrasi Product & Services dengan Booking

-- 1. Buat tabel price_package jika belum ada
CREATE TABLE IF NOT EXISTS price_package (
    id SERIAL PRIMARY KEY,
    pakej VARCHAR(255) NOT NULL,
    harga DECIMAL(10,2) DEFAULT 0.00,
    url TEXT,
    services JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat tabel bookings jika belum ada
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL,
    employee_id INTEGER,
    date DATE NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(100) DEFAULT 'Status Baru',
    custom_fields JSONB DEFAULT '{}',
    package_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat tabel contact jika belum ada
CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    custom_field JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Buat tabel employee jika belum ada
CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Buat tabel colors untuk status management
CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    custom_status VARCHAR(100) NOT NULL UNIQUE,
    code_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default colors jika belum ada
INSERT INTO colors (custom_status, code_color) VALUES
    ('Status Baru', '#3b82f6'),
    ('Dalam Proses', '#f59e0b'),
    ('Selesai', '#22c55e')
ON CONFLICT (custom_status) DO NOTHING;

-- 7. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_price_package_pakej ON price_package(pakej);
CREATE INDEX IF NOT EXISTS idx_bookings_contact_id ON bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 8. Buat foreign key constraints jika belum ada
ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS fk_bookings_contact 
FOREIGN KEY (contact_id) REFERENCES contact(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS fk_bookings_employee 
FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE SET NULL;

ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS fk_bookings_package 
FOREIGN KEY (package_id) REFERENCES price_package(id) ON DELETE SET NULL;

-- 9. Buat trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_price_package_updated_at 
    BEFORE UPDATE ON price_package 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_contact_updated_at 
    BEFORE UPDATE ON contact 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_employee_updated_at 
    BEFORE UPDATE ON employee 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert sample data untuk testing (opsional)
INSERT INTO price_package (pakej, harga, url, services) VALUES
    ('Paket Basic', 100.00, 'https://example.com/basic', '{"durasi": "1 jam", "kategori": "Fotografi"}'),
    ('Paket Premium', 250.00, 'https://example.com/premium', '{"durasi": "2 jam", "kategori": "Fotografi", "include_editing": true}')
ON CONFLICT (id) DO NOTHING;

-- 11. Verifikasi struktur tabel
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('price_package', 'bookings', 'contact', 'employee', 'colors')
ORDER BY table_name, ordinal_position;

-- 12. Verifikasi data
SELECT 'price_package' as table_name, COUNT(*) as record_count FROM price_package
UNION ALL
SELECT 'bookings' as table_name, COUNT(*) as record_count FROM bookings
UNION ALL
SELECT 'contact' as table_name, COUNT(*) as record_count FROM contact
UNION ALL
SELECT 'employee' as table_name, COUNT(*) as record_count FROM employee
UNION ALL
SELECT 'colors' as table_name, COUNT(*) as record_count FROM colors;
