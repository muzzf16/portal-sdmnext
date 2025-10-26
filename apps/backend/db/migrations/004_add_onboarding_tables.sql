
-- =============================
-- TABLE: onboarding_tasks
-- =============================
CREATE TABLE IF NOT EXISTS tugas_orientasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    task_name TEXT,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT 0,
    completed_date DATE,
    FOREIGN KEY (employee_id) REFERENCES pegawai(id)
);
