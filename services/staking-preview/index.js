const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4010;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'staking.json');

async function readDb() {
  await fs.ensureDir(DATA_DIR);
  if (!(await fs.pathExists(DB_FILE))) {
    await fs.writeJSON(DB_FILE, { stakes: [] }, { spaces: 2 });
  }
  return fs.readJSON(DB_FILE);
}

async function writeDb(db) {
  await fs.writeJSON(DB_FILE, db, { spaces: 2 });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/stakes', async (_req, res) => {
  const db = await readDb();
  res.json(db);
});

app.post('/stake', async (req, res) => {
  const { amount, signature, wallet } = req.body || {};
  if (!amount || !wallet) return res.status(400).json({ error: 'amount and wallet required' });
  const db = await readDb();
  db.stakes.push({
    type: 'stake',
    amount: Number(amount),
    wallet,
    signature: signature || null,
    createdAt: Date.now(),
  });
  await writeDb(db);
  res.json({ ok: true });
});

app.post('/unstake', async (req, res) => {
  const { amount, wallet } = req.body || {};
  if (!amount || !wallet) return res.status(400).json({ error: 'amount and wallet required' });
  const db = await readDb();
  db.stakes.push({
    type: 'unstake',
    amount: Number(amount),
    wallet,
    createdAt: Date.now(),
  });
  await writeDb(db);
  res.json({ ok: true });
});

app.post('/claim', async (req, res) => {
  const { amount, wallet } = req.body || {};
  if (!amount || !wallet) return res.status(400).json({ error: 'amount and wallet required' });
  const db = await readDb();
  db.stakes.push({
    type: 'claim',
    amount: Number(amount),
    wallet,
    createdAt: Date.now(),
  });
  await writeDb(db);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`[staking-preview] listening on :${PORT}`));
