-- =============================
-- MIGRATION: Add gender column to pegawai table
-- =============================
-- Add jenis_kelamin column for gender (L for Laki-laki/male, P for Perempuan/female)
-- Note: SQLite has limited ALTER TABLE support, so this adds the column without CHECK constraint
-- The constraint will be enforced in the application layer
ALTER TABLE pegawai ADD COLUMN jenis_kelamin TEXT;

-- Note: The avatarUrl column already exists in the table
-- It will be used to store the path/URL to the employee's profile photo