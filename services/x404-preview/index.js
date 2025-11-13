import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4004;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mints.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

function readMints() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeMints(list) {
  fs.writeFileSync(DB_FILE, JSON.stringify(list.slice(0, 500)));
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/mints', (req, res) => {
  res.json({ items: readMints() });
});

app.post('/mint', (req, res) => {
  const { agentId } = req.body || {};
  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ error: 'agentId is required' });
  }
  // Generate deterministic-ish fake PDA-like address
  const nftMint = 'NF' + nanoid(40);
  const txSignature = 'demo_' + nanoid(64);
  const record = {
    agentId,
    nftMint,
    txSignature,
    programId: process.env.X404_PROGRAM_ID || 'preview',
    previewMode: true,
    createdAt: Date.now(),
  };
  const list = readMints();
  list.unshift(record);
  writeMints(list);
  res.json({ success: true, ...record });
});

app.listen(PORT, () => {
  console.log(`X404 Preview API running on :${PORT}`);
});
