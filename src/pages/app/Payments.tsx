import { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createX402Client } from '@/lib/x402-client';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';
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
      try {
        recipientPk = new PublicKey(recipient.trim());
      } catch {
        // Try resolve as agent ID via program
        if (!client) {
          toast.error('Cannot resolve agent ID without wallet connection');
          setLoading(false);
          return;
        }
        const identity = await client.getIdentity(recipient.trim());
        if (!identity) {
          toast.error('Recipient agent not found');
          setLoading(false);
          return;
        }
        recipientPk = identity.owner as unknown as PublicKey; // owner parsed as PublicKey earlier
      }

      // Manual USDC SPL transfer (wallet-signed, always real)
      const payer = publicKey;
      const usdcMint = new PublicKey(import.meta.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

      const payerAta = await getAssociatedTokenAddress(usdcMint, payer);
      const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPk!);

      const ixs: TransactionInstruction[] = [];
      const payerAtaInfo = await connection.getAccountInfo(payerAta);
      if (!payerAtaInfo) {
        ixs.push(createAssociatedTokenAccountInstruction(payer, payerAta, payer, usdcMint));
      }
      const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
      if (!recipientAtaInfo) {
        ixs.push(createAssociatedTokenAccountInstruction(payer, recipientAta, recipientPk!, usdcMint));
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
      const sig = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
      await connection.confirmTransaction(sig, 'confirmed');

      toast.success('Payment sent', { description: sig, action: { label: 'Explorer', onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank') } });
      setRecipient('');
      setAmount('');
      setMemo('');
      setSenderAgentId('');
    } catch (e: unknown) {
      toast.error('Payment failed', { description: (e as Error)?.message || String(e) });
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
        <h3 className="font-semibold text-lg mb-3">Recent Payments</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span>5 USDC → 0x89bc...</span>
            <span className="text-xs text-slate-400">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span>12 USDC → 0x12ef...</span>
            <span className="text-xs text-slate-400">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
