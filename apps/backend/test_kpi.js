async function run() {
    try {
        const res = await fetch('http://localhost:3333/api/kpi-targets');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}
run();
