import LaporanKepatuhanService from './src/modules/laporan-kepatuhan/laporan-kepatuhan.service';
import { openDb } from './src/config/db';

async function test() {
  try {
    // initialize db properly
    process.env.DB_SOURCE = '../../database.sqlite';
    const res = await LaporanKepatuhanService.getByEmployeeId('emp-1760677257306');
    console.log(res);
  } catch(e) {
    console.error("SERVICE ERROR:", e);
  }
}
test();
