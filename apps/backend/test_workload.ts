import { WorkloadService } from './src/modules/workload/workload.service';

async function test() {
  process.env.DB_SOURCE = '../../database.sqlite';
  try {
    const data = await WorkloadService.getByEmployeeId('emp-1780374718768');
    console.log("SUCCESS:", data);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}
test();
