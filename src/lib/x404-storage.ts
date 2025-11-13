export interface X404MintRecord {
  agentId: string;
  nftMint: string;
  txSignature: string;
  programId: string;
  previewMode: boolean;
  createdAt: number;
}

const KEY = 'x404_mints_v1';

function safeRead(): X404MintRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as X404MintRecord[];
    if (!Array.isArray(arr)) return [];
    return arr.filter(r => r && typeof r === 'object' && 'agentId' in r && 'nftMint' in r);
  } catch {
    return [];
  }
}

function safeWrite(list: X404MintRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    // ignore
  }
}

export function addX404Mint(record: X404MintRecord) {
  const list = safeRead();
  // de-duplicate by tx or mint
  const exists = list.find(
    r => r.txSignature === record.txSignature || r.nftMint === record.nftMint
  );
  if (!exists) {
    list.unshift(record);
    safeWrite(list);
  }
}

export function listX404Mints(): X404MintRecord[] {
  return safeRead();
}

export function clearX404Mints() {
  safeWrite([]);
}
