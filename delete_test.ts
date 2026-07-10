import { openDb } from './apps/backend/src/config/db';
import { PegawaiRepository } from './apps/backend/src/modules/pegawai/pegawai.repository';

async function run() {
  try {
    const deleted = await PegawaiRepository.delete('emp-1772526868641');
    console.log("Deleted:", deleted);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
