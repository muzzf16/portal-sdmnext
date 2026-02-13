
-- 📊 ANALISIS BEBAN KERJA (ABK)
CREATE TABLE IF NOT EXISTS analisis_beban_kerja (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    year INTEGER NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    totalYearlyMinutes INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('draft','submitted','approved','returned')) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);

-- 📝 DETAIL ITEM ABK
CREATE TABLE IF NOT EXISTS detail_beban_kerja (
    id TEXT PRIMARY KEY,
    analysisId TEXT NOT NULL,
    activityName TEXT NOT NULL,
    outputUnit TEXT, -- e.g. "Dokumen", "Nasabah", "Transaksi"
    durationMinutes INTEGER DEFAULT 0,
    freqDaily INTEGER DEFAULT 0,
    freqWeekly INTEGER DEFAULT 0,
    freqMonthly INTEGER DEFAULT 0,
    freqQuarterly INTEGER DEFAULT 0,
    freqSemester INTEGER DEFAULT 0,
    freqYearly INTEGER DEFAULT 0,
    totalMinutes INTEGER DEFAULT 0,
    FOREIGN KEY (analysisId) REFERENCES analisis_beban_kerja(id) ON DELETE CASCADE
);
