
-- =============================
-- TABLE: candidates
-- =============================
CREATE TABLE IF NOT EXISTS kandidat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    position_applied TEXT,
    status TEXT DEFAULT 'Applied' CHECK(status IN ('Applied', 'Interviewing', 'Offered', 'Hired', 'Rejected')), -- Applied, Interviewing, Offered, Hired, Rejected
    resume_url TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP
);
