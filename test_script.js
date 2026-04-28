const axios = require('axios');
axios.get('http://localhost:3333/api/employees').then(res => {
  const data = res.data;
  if(data && data.data) {
    const d = data.data.find(e => e.position && e.position.toLowerCase() === 'direktur utama');
    console.log("FOUND:", d);
  } else {
    console.log("No data array");
  }
}).catch(console.error);
