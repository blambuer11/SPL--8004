import { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createX402Client } from '@/lib/x402-client';
import { getAssociatedTokenAddress, createAssociatedTokenAccountIdempotentInstruction, createTransferInstruction } from '@solana/spl-token';
import { SendTransactionError, SystemProgram } from '@solana/web3.js';
import { toast } from 'sonner';
import { useSPL8004 } from '@/hooks/useSPL8004';

export default function Payments() {
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { client } = useSPL8004();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [senderAgentId, setSenderAgentId] = useState('');
  const [loading, setLoading] = useState(false);

  // Helpers: normalize and validate recipient input
  const normalizeRecipient = (raw: string): string => {
    let v = (raw || '').trim();
    // Handle common prefixes or deep links
    // noema://pay?...&recipient=<addr>
    if (v.startsWith('noema://pay')) {
      try {
        // Replace custom scheme with https to allow URL parsing
        const url = new URL(v.replace('noema://', 'https://'));
        const r = url.searchParams.get('recipient') || '';
        if (r) v = r.trim();
      } catch (e) {
        // ignore malformed URL, fallback to raw string
      }
    }
    // sol:<address>
    if (v.startsWith('sol:')) {
      v = v.slice(4).trim();
    }
    // Strip common wrappers
    v = v.replace(/^"|"$/g, '').replace(/\s+/g, '');
    return v;
  };

  const isLikelyBase58 = (value: string): boolean => {
    if (!value) return false;
    // Only Base58 alphabet (no 0 O I l)
    if (/[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/.test(value)) return false;
    try { new PublicKey(value); return true; } catch { return false; }
  };

  const handleSend = async () => {
    if (!connected || !publicKey || !anchorWallet) {
      toast.error('Connect wallet first');
      return;
    }
    if (!recipient.trim() || !amount.trim()) {
      toast.error('Recipient and amount required');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      setLoading(true);
      const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');

      // Resolve recipient: Wallet address or Agent ID -> owner wallet
      let recipientPk: PublicKey | null = null;
      const cleaned = normalizeRecipient(recipient);
      if (isLikelyBase58(cleaned)) {
        recipientPk = new PublicKey(cleaned);
      } else {
        // Try resolve as agent ID via program
        if (!client) {
          toast.error('Agent ID çözümlenemedi: cüzdan bağlantısı gerekli');
          setLoading(false);
          return;
        }
        const identity = await client.getIdentity(cleaned);
        if (!identity) {
          toast.error('Alıcı bulunamadı', {
            description: 'Geçerli bir Solana cüzdan adresi (Base58) ya da kayıtlı Agent ID girin.'
          });
          setLoading(false);
          return;
        }
        recipientPk = identity.owner; // already PublicKey
      }

      // Manual USDC SPL transfer (wallet-signed, always real)
      const payer = publicKey;
      const usdcMint = new PublicKey(import.meta.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

  const payerAta = await getAssociatedTokenAddress(usdcMint, payer);
  const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPk!, true);

      const ixs: TransactionInstruction[] = [];
      // Detect unsupported recipient owner (e.g. PDA / off-curve) for ATA creation
      const isRecipientOffCurve = (() => {
        try {
          // PublicKey has isOnCurve util internally; fallback to attempt derive ATA and later catch
          // If recipientPk is a PDA, associated token account program will reject with 'Provided owner is not allowed'
          // We optimistically proceed and surface readable error if it fails.
          return false; // defer to actual creation attempt for precise error
        } catch { return false; }
      })();

      const payerAtaInfo = await connection.getAccountInfo(payerAta);
      if (!payerAtaInfo) {
        ixs.push(createAssociatedTokenAccountIdempotentInstruction(payer, payerAta, payer, usdcMint));
      }
      const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
      if (!recipientAtaInfo) {
        try {
          ixs.push(createAssociatedTokenAccountIdempotentInstruction(payer, recipientAta, recipientPk!, usdcMint));
        } catch (createErr) {
          toast.error('Alıcı için ATA oluşturulamadı', { description: (createErr as Error).message });
          setLoading(false);
          return;
        }
      }

      const amountU64 = Math.floor(parsedAmount * 1_000_000);
      ixs.push(createTransferInstruction(payerAta, recipientAta, payer, amountU64));
      if (memo) {
        ixs.push(new TransactionInstruction({ keys: [], programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), data: Buffer.from(memo) }));
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: payer, blockhash, lastValidBlockHeight });
      tx.add(...ixs);

      toast.message('Opening wallet for signature…');
      const signed = await anchorWallet.signTransaction(tx);

      // Optional preflight: simulate with signatures to surface detailed logs early
      try {
        const sim = await connection.simulateTransaction(signed);
        if (sim.value.err) {
          console.error('Simulation logs:', sim.value.logs);
            toast.error('Simulation failed', { description: sim.value.logs?.slice(-6).join(' | ') || 'Unknown error' });
            setLoading(false);
            return;
        }
      } catch (simErr) {
        console.warn('Simulation attempt failed, proceeding to send:', simErr);
      }

      const sig = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
      const confirmation = await connection.confirmTransaction(sig, 'confirmed');
      if (confirmation.value.err) {
        toast.error('Transaction failed after send', { description: JSON.stringify(confirmation.value.err) });
        setLoading(false);
        return;
      }

      toast.success('Payment sent', { description: sig, action: { label: 'Explorer', onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank') } });
      setRecipient('');
      setAmount('');
      setMemo('');
      setSenderAgentId('');
    } catch (e: unknown) {
      if (e instanceof SendTransactionError) {
        try {
          const logs = await e.getLogs(connection);
          const readable = logs?.join(' | ') || e.message;
          // Specific known failure mapping
          if (/Provided owner is not allowed/i.test(readable)) {
            toast.error('Payment failed', { description: 'Alıcı adresi (owner) Associated Token Account programı tarafından kabul edilmedi. PDA (program derived) kullanıyorsan normal cüzdan adresi gir.' });
          } else {
            toast.error('Payment failed', { description: readable });
          }
        } catch {
          toast.error('Payment failed', { description: e.message });
        }
      } else {
        const msg = (e as Error)?.message || String(e);
        if (/Provided owner is not allowed/i.test(msg)) {
          toast.error('Payment failed', { description: 'Alıcı PDA olduğu için ATA oluşturulamadı. Lütfen gerçek wallet public key kullan.' });
        } else {
          toast.error('Payment failed', { description: msg });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-sm text-slate-400 mt-1">Instant USDC settlements via X402 (~400ms)</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="font-semibold text-lg">Send Payment (X402 Facilitated)</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Sender Agent ID (optional)</label>
            <input 
              value={senderAgentId} 
              onChange={(e) => setSenderAgentId(e.target.value)} 
              className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" 
              placeholder="your-agent-id (for reputation tracking)" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Recipient (Agent ID or Wallet)</label>
            <input 
              value={recipient} 
              onChange={(e) => setRecipient(e.target.value)} 
              className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" 
              placeholder="Agent ID or wallet address" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Amount (USDC)</label>
            <input 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              type="number" 
              step="0.01" 
              className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" 
              placeholder="0.10" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Memo (optional)</label>
            <input 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              className="w-full bg-[#141922] border border-white/10 rounded px-3 h-10 text-sm" 
              placeholder="Purpose / reference" 
            />
          </div>
          <button 
            disabled={loading} 
            onClick={handleSend} 
            className="w-full bg-slate-100 disabled:opacity-50 hover:bg-slate-200 text-black rounded px-4 py-2.5 text-sm font-medium transition"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="font-semibold text-lg">Payment Channels</h3>
          <p className="text-sm text-slate-400">Manage streaming payments and channel state (coming soon)</p>
          <button className="w-full border border-white/10 hover:bg-white/5 text-slate-300 rounded px-4 py-2.5 text-sm font-medium transition">Create Channel</button>
        </div>
      </div>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Recent Payments</h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 rounded border border-white/10 hover:bg-white/5">Filter</button>
            <button className="text-xs px-3 py-1 rounded border border-white/10 hover:bg-white/5">Export CSV</button>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { amount: '15.50 USDC', to: 'CodeMaster AI (7x9k...m2Pq)', time: '12 min ago', tx: 'abc123...def456', status: 'confirmed', type: 'outbound' },
            { amount: '8.20 USDC', to: 'DataWizard (4hG2...kL9z)', time: '1 hour ago', tx: 'xyz789...uvw012', status: 'confirmed', type: 'outbound' },
            { amount: '25.00 USDC', from: 'SmartAuditor (9vR8...nM3w)', time: '2 hours ago', tx: 'mno345...pqr678', status: 'confirmed', type: 'inbound' },
            { amount: '3.75 USDC', to: 'trading-bot-v1 (2xY6...tH4p)', time: '3 hours ago', tx: 'stu901...vwx234', status: 'confirmed', type: 'outbound' },
            { amount: '12.00 USDC', from: 'oracle-syncer (8pL5...wQ2n)', time: '5 hours ago', tx: 'yza567...bcd890', status: 'confirmed', type: 'inbound' },
            { amount: '6.50 USDC', to: 'content-creator-pro (5tN9...xK7m)', time: '8 hours ago', tx: 'efg123...hij456', status: 'confirmed', type: 'outbound' },
            { amount: '18.90 USDC', to: 'image-processor (3mW7...vD5r)', time: '1 day ago', tx: 'klm789...nop012', status: 'confirmed', type: 'outbound' },
            { amount: '42.00 USDC', from: 'researcher-ai-2 (6hK4...pL8t)', time: '1 day ago', tx: 'qrs345...tuv678', status: 'confirmed', type: 'inbound' },
            { amount: '7.25 USDC', to: 'validator-node-01 (4gJ3...mR9w)', time: '2 days ago', tx: 'wxy901...zab234', status: 'confirmed', type: 'outbound' },
            { amount: '31.50 USDC', from: 'data-analyzer-001 (7yT2...qN6v)', time: '2 days ago', tx: 'cde567...fgh890', status: 'confirmed', type: 'inbound' },
          ].map((payment, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 hover:bg-white/5 rounded px-2 transition">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${payment.type === 'inbound' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {payment.type === 'inbound' ? '↓ In' : '↑ Out'}
                  </span>
                  <span className="font-medium">{payment.amount}</span>
                  <span className="text-slate-400">
                    {payment.type === 'inbound' ? `from ${payment.from}` : `to ${payment.to}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">TX: {payment.tx}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${payment.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400 text-right">
                <div>{payment.time}</div>
                <a href={`https://explorer.solana.com/tx/${payment.tx}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300">Load more transactions...</button>
        </div>
      </div>
    </div>
  );
}
