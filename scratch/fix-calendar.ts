import fs from 'fs';

let content = fs.readFileSync('apps/frontend/src/features/06-kinerja/utils/holidayCalendar.ts', 'utf8');

const replacement = `
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    const dateStr = \`\${year}-\${month}-\${day}\`;
`.trim();

content = content.replace(/const dateStr = cur\.toISOString\(\)\.slice\(0, 10\);/g, replacement);

fs.writeFileSync('apps/frontend/src/features/06-kinerja/utils/holidayCalendar.ts', content);
