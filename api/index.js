const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/languages', (req, res) => {
  res.json([
    { id: 1, name: "C" },
    { id: 2, name: "C++" },
    { id: 3, name: "Python" },
    { id: 4, name: "java" }
  ]);
});

app.get('/', (req, res) => {
  res.send('Judge0 API is running...');
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});

