(async () => {
    try {
        const formData = new FormData();
        formData.append("name", "Test 222");
        formData.append("email", "test222@example.com");
        formData.append("position", "IT");
        formData.append("department", "IT");
        formData.append("educationHistory", "[]");

        const res = await fetch('http://127.0.0.1:3333/api/employees/with-user', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch (err) {
        console.error(err);
    }
})();
