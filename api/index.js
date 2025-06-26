const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/languages', (req, res) => {
  res.json([
    { id: 50, name: "C" },
    { id: 54, name: "C++" },
    { id: 62, name: "Java" },
    // add more languages as needed
  ]);
});

app.listen(port, () => {
  console.log(`Judge0 API running on port ${port}`);
});
