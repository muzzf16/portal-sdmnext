(async () => {
    try {
        const res = await fetch('http://127.0.0.1:3333/api/employees/with-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test 111",
                email: "test111@example.com",
                position: "IT",
                department: "IT"
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch (err) {
        console.error(err);
    }
})();
