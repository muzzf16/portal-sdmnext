async function test() {
  try {
    const res = await fetch('http://localhost:3334/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin1@company.com', password: 'password123' })
    });
    const data = await res.json();
    console.log("LOGIN STATUS:", res.status);
    if (!data.data || !data.data.accessToken) {
      console.log("LOGIN FAILED:", data);
      return;
    }
    const token = data.data.accessToken;

    const res2 = await fetch('http://localhost:3334/api/employees', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log("EMPLOYEES API STATUS:", res2.status);
    console.log("EMPLOYEES API RESPONSE:", JSON.stringify(data2).substring(0, 200));
  } catch (err) {
    console.error(err.message);
  }
}
test();
