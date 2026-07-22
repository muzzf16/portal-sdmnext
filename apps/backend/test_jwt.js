const jwt = require('jsonwebtoken');

async function test() {
  try {
    const token = jwt.sign({
      userId: 'test_user_id',
      employeeId: 'emp-1760677257306',
      role: 'employee',
      email: 'ikasujiati@gmail.com'
    }, 'your-secret-key', { expiresIn: '1h' });
    
    console.log("GENERATED TOKEN:", token);
    
    const res2 = await fetch('http://localhost:3334/api/laporan-kepatuhan/my-reports', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log("STATUS:", res2.status);
    console.log("RESPONSE:", data2);
  } catch(e) {
    console.error(e);
  }
}
test();
