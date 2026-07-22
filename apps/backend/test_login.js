async function test() {
  try {
    const res = await fetch('http://localhost:3334/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ikasujiati@gmail.com', password: 'password123' })
    });
    const data = await res.json();
    console.log("TOKEN:", data.data.accessToken);

    const res2 = await fetch('http://localhost:3334/api/laporan-kepatuhan/my-reports', {
      headers: { Authorization: `Bearer ${data.data.accessToken}` }
    });
    const data2 = await res2.json();
    console.log("STATUS:", res2.status);
    console.log("RESPONSE:", data2);
  } catch (err) {
    console.error(err.message);
  }
}
test();
