// Treasury: Tüm API subscription ödemeleri bu cüzdana gider
// 3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { amount, label = 'Noema Subscription', message = 'Subscription Payment', memo = 'noema' } = body;
    
    // Treasury cüzdanı - tüm subscription ödemeleri buraya
    const recipient = process.env.RECEIVING_SOLANA_ADDRESS || '3oxg7wVtdp9T3sx773SMmws8zrGyAJecqTruaXfiw3mN';
    const usdcMint = process.env.USDC_MINT_MAINNET || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    if (!recipient) return res.status(501).json({ error: 'RECEIVING_SOLANA_ADDRESS not configured' });
    if (!amount || isNaN(Number(amount))) return res.status(400).json({ error: 'Invalid amount' });

    const url = new URL(`solana:${recipient}`);
    url.searchParams.set('amount', String(amount));
    url.searchParams.set('spl-token', usdcMint);
    url.searchParams.set('label', label);
    url.searchParams.set('message', message);
    url.searchParams.set('memo', memo);

    // Revenue tracking için log
    console.log(`[TREASURY] Subscription payment: ${amount} USDC to ${recipient}, plan: ${memo}`);

    return res.status(200).json({ url: url.toString() });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Invalid request' });
  }
}
