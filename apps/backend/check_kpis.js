const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.all("SELECT id, kpiName, weight, category, employeeId FROM kpi_targets", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(rows);
            // Summarize weight by employeeId
            const map = {};
            for (const r of rows) {
                if (!map[r.employeeId]) map[r.employeeId] = 0;
                map[r.employeeId] += r.weight;
            }
            console.log("Total Weight by Employee:", map);
        }
        db.close();
    });
});
