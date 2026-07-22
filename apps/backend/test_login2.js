async function test() {
  try {
    const res = await fetch('http://localhost:3334/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ikasujiati@gmail.com', password: 'password123' })
    });
    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);
  } catch (err) {
    console.error(err.message);
  }
}
test();
