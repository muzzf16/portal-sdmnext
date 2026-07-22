import PegawaiService from './src/modules/pegawai/pegawai.service';

async function test() {
  process.env.DB_SOURCE = '../../database.sqlite';
  try {
    const data = await PegawaiService.getAllPegawai({});
    console.log("SUCCESS:", data.length);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}
test();
