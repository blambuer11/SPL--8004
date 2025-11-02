import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

function toNum(v, d = 0) {
  const n = Number(v);
  return isNaN(n) ? d : n;
}

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { amount, memo, withinSeconds = 3600, recipient, usdcMint } = body;

    const rpcUrl = getEnv('UPSTREAM_SOLANA_RPC', 'https://api.mainnet-beta.solana.com');
    const recipientAddr = recipient || getEnv('RECEIVING_SOLANA_ADDRESS');
    const usdc = usdcMint || getEnv('USDC_MINT_MAINNET', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    if (!recipientAddr) return res.status(501).json({ error: 'RECEIVING_SOLANA_ADDRESS not configured' });
    if (!amount || isNaN(Number(amount))) return res.status(400).json({ error: 'Invalid amount' });
    if (!memo || typeof memo !== 'string') return res.status(400).json({ error: 'Invalid memo' });

    const expected = Math.round(Number(amount) * 1_000_000); // USDC 6 decimals
    const now = Math.floor(Date.now() / 1000);

    const connection = new Connection(rpcUrl, 'confirmed');
    const recipientPk = new PublicKey(recipientAddr);
    const usdcPk = new PublicKey(usdc);
    const ata = await getAssociatedTokenAddress(usdcPk, recipientPk, false);

    // Fetch recent signatures to scan
    const sigs = await connection.getSignaturesForAddress(ata, { limit: 50 });

    for (const s of sigs) {
      if (!s?.signature) continue;
      // Time window check
      if (typeof s.blockTime === 'number' && (now - s.blockTime) > toNum(withinSeconds, 3600)) {
        continue;
      }

      const tx = await connection.getTransaction(s.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });
      if (!tx) continue;

      // Check memo
      const hasMemo = tx.transaction.message.instructions.some((ix) => {
        try {
          const pid = ix.programId?.toBase58?.() || ix.programId;
          if (pid !== MEMO_PROGRAM_ID) return false;
          // For v0 tx, ix.data is a Buffer (Node) or Uint8Array; convert to string
          const data = ix.data;
          if (!data) return false;
          const memoStr = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
          return memoStr.includes(memo);
        } catch {
          return false;
        }
      });

      if (!hasMemo) continue;

      // Check token balance delta for recipient ATA
      const pre = tx.meta?.preTokenBalances || [];
      const post = tx.meta?.postTokenBalances || [];
      const preRec = pre.find((b) => b.mint === usdc && b.owner === recipientAddr && b.accountIndex != null);
      const postRec = post.find((b) => b.mint === usdc && b.owner === recipientAddr && b.accountIndex != null);

      if (!postRec) continue; // no usdc post balance for recipient
      const preAmt = preRec ? Number(preRec.uiTokenAmount?.amount || 0) : 0;
      const postAmt = Number(postRec.uiTokenAmount?.amount || 0);
      const delta = postAmt - preAmt;

      if (delta >= expected) {
        return res.status(200).json({ confirmed: true, signature: s.signature, blockTime: s.blockTime, amount: delta / 1_000_000 });
      }
    }

    return res.status(200).json({ confirmed: false });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Verification error' });
  }
}
