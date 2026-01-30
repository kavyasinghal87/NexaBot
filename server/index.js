const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const { analyzeCode, getHistory, analyzeComplexity, compareCode, purgeHistory } = require('./src/controllers/audit.controller');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.send('Nexa Audit API is running');
});

const { getTestCases, runVirtual } = require('./src/controllers/testbench.controller');

app.post('/api/audit', analyzeCode);
app.post('/api/audit/analyze', analyzeComplexity);
app.post('/api/audit/compare', compareCode);
app.get('/api/history/:userId', getHistory);
app.delete('/api/history/:userId', purgeHistory);

// Test Bench Routes
app.post('/api/testbench/cases', getTestCases);
app.post('/api/testbench/run', runVirtual);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
