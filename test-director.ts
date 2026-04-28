import { PegawaiRepository } from './apps/backend/src/modules/pegawai/pegawai.repository';
import * as dotenv from 'dotenv';
dotenv.config({ path: './apps/backend/.env' });

async function run() {
    const pegawai = await PegawaiRepository.findAll();
    console.log(pegawai.find(e => e.position?.toUpperCase() === 'DIREKTUR UTAMA'));
}
run().catch(console.error);
