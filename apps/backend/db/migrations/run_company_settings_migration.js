const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

    const stmts = [
        "ALTER TABLE company_settings ADD COLUMN workStartTime TEXT DEFAULT '08:00'",
        "ALTER TABLE company_settings ADD COLUMN workEndTime TEXT DEFAULT '17:00'",
        "ALTER TABLE company_settings ADD COLUMN lateToleranceMinutes INTEGER DEFAULT 15",
        "ALTER TABLE company_settings ADD COLUMN annualLeaveQuota INTEGER DEFAULT 12",
        "ALTER TABLE company_settings ADD COLUMN sickLeaveQuota INTEGER DEFAULT 14",
        "ALTER TABLE company_settings ADD COLUMN bankName TEXT DEFAULT ''",
        "ALTER TABLE company_settings ADD COLUMN bankAccountNumber TEXT DEFAULT ''",
        "ALTER TABLE company_settings ADD COLUMN payrollDate INTEGER DEFAULT 25"
    ];

    for (const s of stmts) {
        try {
            await db.run(s);
            console.log('OK:', s.substring(0, 65));
        } catch (e) {
            console.log('SKIP (exists):', s.substring(0, 65), '-', e.message);
        }
    }

    const row = await db.get('SELECT * FROM company_settings LIMIT 1');
    console.log('\nCurrent settings:', JSON.stringify(row, null, 2));

    await db.close();
})();
