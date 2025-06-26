require('dotenv').config();
const axios = require('axios');
const apiUrl = process.env.API_URL || "http://localhost:3000";

console.log("Worker started...");
console.log("API URL is:", apiUrl);

setInterval(async () => {
  try {
    const res = await axios.get(`${apiUrl}/languages`);
    console.log("Available languages:", res.data);
  } catch (err) {
    console.error("Worker error:", err?.message || err?.response?.data || err);
  }
}, 10000);
