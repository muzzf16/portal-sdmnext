
import { openDb } from '../src/config/db';

async function seedCompanySettings() {
  const db = await openDb();
  await db.run("INSERT INTO company_settings (companyName, npwp, address, logo) VALUES (?, ?, ?, ?)", [
    'PT BPR BAPERA BATANG',
    '1234567890',
    'Jl. Raya Batang No. 123',
    '/logos/logo.png'
  ]);
  console.log('Company settings seeded successfully');
}

seedCompanySettings();
