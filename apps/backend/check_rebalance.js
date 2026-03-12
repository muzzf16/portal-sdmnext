const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/data/database.sqlite');

const employeeId = 'emp-1760677257306'; // The TI employee we found with 600 total weight
let targetComp = { process: 50, outcome: 35, strategic: 15 };

db.serialize(() => {
    db.all("SELECT id, kpiName, weight, category, employeeId FROM kpi_targets WHERE employeeId = ?", [employeeId], (err, kpis) => {
        if (err) return console.error(err);

        const kpisByCategory = { process: [], outcome: [], strategic: [] };
        
        for (const kpi of kpis) {
            let cat = (kpi.category || 'process').toLowerCase().trim();
            if (cat.includes('proses')) cat = 'process';
            if (cat.includes('outcome') || cat.includes('hasil')) cat = 'outcome';
            if (cat.includes('strategic') || cat.includes('strategis')) cat = 'strategic';

            if (kpisByCategory[cat]) {
                kpisByCategory[cat].push(kpi);
            } else {
                kpisByCategory.process.push(kpi);
            }
        }

        const updates = [];
        const targetEntries = Object.entries(targetComp);

        for (const [cat, targetPct] of targetEntries) {
            const catKpis = kpisByCategory[cat];
            if (catKpis.length === 0) continue;

            const currentCatTotalWeight = catKpis.reduce((sum, k) => sum + (Number(k.weight) || 0), 0);
            let remainingPct = Number(targetPct);

            console.log(`\n[Cat: ${cat}] KPIs: ${catKpis.length}, Target %: ${targetPct}, Current W: ${currentCatTotalWeight}`);

            for (let i = 0; i < catKpis.length; i++) {
                const kpi = catKpis[i];
                let newWeight = 0;

                if (i === catKpis.length - 1) {
                    newWeight = remainingPct;
                    console.log(`  -> [LAST] ${kpi.kpiName} gets EXACT rest: ${newWeight}`);
                } else {
                    if (currentCatTotalWeight === 0) {
                            newWeight = Math.floor(targetPct / catKpis.length);
                    } else {
                            const currentKpiWeight = Number(kpi.weight) || 0;
                            newWeight = Math.round((currentKpiWeight / currentCatTotalWeight) * targetPct);
                    }
                    
                    if (newWeight <= 0) newWeight = 1;
                    
                    const maxAllowed = remainingPct - (catKpis.length - 1 - i);
                    if (newWeight > maxAllowed && maxAllowed > 0) {
                        newWeight = maxAllowed;
                    }

                    remainingPct -= newWeight;
                    console.log(`  -> ${kpi.kpiName}. curW:${kpi.weight} => Calc: ${newWeight}, Remain: ${remainingPct}`);
                }
                updates.push({ id: kpi.id, newWeight });
            }
        }
        
        console.log("\nTotal Rebalanced Weight:", updates.reduce((acc, u) => acc + u.newWeight, 0));
        db.close();
    });
});
