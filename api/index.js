const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '5mb' }));

const LANGS = {
  "c": {
    extension: "c",
    compile: (filename) => `gcc ${filename} -o ${filename}.out`,
    run: (filename) => `${filename}.out`
  },
  "cpp": {
    extension: "cpp",
    compile: (filename) => `g++ ${filename} -o ${filename}.out`,
    run: (filename) => `${filename}.out`
  },
  "python": {
    extension: "py",
    compile: null,
    run: (filename) => `python3 ${filename}`
  },
  "java": {
    extension: "java",
    compile: (filename) => `javac ${filename}`,
    run: (filename) => {
      const dir = path.dirname(filename);
      const classname = path.basename(filename, '.java');
      return `java -cp ${dir} ${classname}`;
    }
  }
};

app.get('/languages', (req, res) => {
  const langs = Object.keys(LANGS).map(key => ({ id: key, name: key }));
  res.json(langs);
});

app.post('/submissions', async (req, res) => {
  try {
    const { language_id, source_code, stdin = "" } = req.body;

    if (!LANGS[language_id]) {
      return res.status(400).json({ error: "Unsupported language_id" });
    }

    const prefix = crypto.randomBytes(6).toString('hex');
    const langData = LANGS[language_id];
    const sourceFile = path.join(__dirname, `${prefix}.${langData.extension}`);
    const inputFile = path.join(__dirname, `${prefix}.input`);

    fs.writeFileSync(sourceFile, source_code);
    fs.writeFileSync(inputFile, stdin);

    let compileCmd = null;
    if (langData.compile) {
      compileCmd = langData.compile(sourceFile);
    }
    const runCmd = langData.run(sourceFile);

    if (compileCmd) {
      exec(compileCmd, (compileErr, stdout, stderr) => {
        if (compileErr) {
          cleanupFiles();
          return res.json({
            compile_output: stderr || stdout,
            stderr: null,
            stdout: null,
            status: { id: 6, description: "Compilation Error" }
          });
        }
        runCode();
      });
    } else {
      runCode();
    }

    function runCode() {
      exec(`${runCmd} < ${inputFile}`, { timeout: 5000 }, (runErr, stdout, stderr) => {
        cleanupFiles();

        if (runErr) {
          let status = { id: 3, description: "Runtime Error" };
          if (runErr.killed) {
            status = { id: 5, description: "Time Limit Exceeded" };
          }
          return res.json({
            compile_output: null,
            stdout: null,
            stderr: stderr || runErr.message,
            status
          });
        }
        res.json({
          compile_output: null,
          stdout: stdout,
          stderr: stderr,
          status: { id: 3, description: "Accepted" }
        });
      });
    }

    function cleanupFiles() {
      // For Java remove .java, .class files, input file
      fs.unlinkSync(inputFile);

      if (language_id === 'java') {
        const classFile = sourceFile.replace(/\.java$/, '.class');
        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
      } else {
        // For other langs remove source, output, and binary
        if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
        if (fs.existsSync(`${sourceFile}.out`)) fs.unlinkSync(`${sourceFile}.out`);
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Judge0 API clone with Java running on port ${PORT}`);
});
