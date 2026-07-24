PRAGMA foreign_keys=on;
BEGIN TRANSACTION;

-- 1. Soft delete jabatan yang memiliki riwayat WLA
UPDATE activity_library 
SET is_active = 0 
WHERE position = 'Account Officer';

-- 2. Hard delete jabatan dummy yang tidak terpakai sama sekali
DELETE FROM activity_library 
WHERE position IN (
    'Accounting', 
    'Admin Lelang', 
    'Analis Kredit', 
    'CS', 
    'Collection', 
    'Funding', 
    'HRD', 
    'IT', 
    'Kasubid Teller', 
    'Satpam', 
    'Treasury'
);

-- Pastikan 'Semua Jabatan' tetap aman dan is_active = 1
UPDATE activity_library SET is_active = 1 WHERE position = 'Semua Jabatan';

COMMIT;
