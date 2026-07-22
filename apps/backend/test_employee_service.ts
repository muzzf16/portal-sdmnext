import { EmployeeService } from './src/modules/pegawai/employee.service';

async function test() {
  process.env.DB_SOURCE = '../../database.sqlite';
  try {
    const data = await EmployeeService.getAll();
    console.log("SUCCESS:", data.length);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
