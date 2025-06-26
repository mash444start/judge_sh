const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // important for parsing JSON body

app.get('/', (req, res) => {
  res.send('Judge0 API is running...');
});

app.get('/languages', (req, res) => {
  res.json([
    { id: 1, name: "C" },
    { id: 2, name: "C++" },
    { id: 3, name: "Python" },
    { id: 4, name: "Java" }
  ]);
});

// 🧪 Mock submissions store (RAM based)
let submissions = {};
let tokenCounter = 1;

// ✅ POST /submissions
app.post('/submissions', (req, res) => {
  const { language_id, source_code, stdin } = req.body;

  if (!language_id || !source_code) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const token = `token-${tokenCounter++}`;
  submissions[token] = {
    stdout: `Executed ${source_code.slice(0, 20)}...`,
    stderr: null,
    compile_output: null,
    status: { id: 3, description: "Accepted" }
  };

  res.json({ token });
});

// ✅ GET /submissions/:token
app.get('/submissions/:token', (req, res) => {
  const result = submissions[req.params.token];
  if (!result) {
    return res.status(404).json({ error: "Token not found" });
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});

