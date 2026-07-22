const { LaporanKepatuhanRepository } = require('./dist/modules/laporan-kepatuhan/laporan-kepatuhan.repository.js');
async function test() {
  try {
    const res = await LaporanKepatuhanRepository.findByEmployeeId('emp-1760677257306');
    console.log(res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
