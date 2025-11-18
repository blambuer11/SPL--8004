import { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, TransactionInstruction, Keypair } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountIdempotentInstruction, 
  createTransferInstruction,
  getMinimumBalanceForRentExemptAccount,
  createInitializeAccountInstruction,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from '@solana/spl-token';
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

  const normalizeRecipient = (raw: string): string => {
    let v = (raw || '').trim();
    if (v.startsWith('noema://pay')) {
      try {
        const url = new URL(v.replace('noema://', 'https://'));
        const r = url.searchParams.get('recipient') || '';
        if (r) v = r.trim();
      } catch (e) {
        // ignore malformed URL
      }
    }
    if (v.startsWith('sol:')) {
      v = v.slice(4).trim();
    }
    v = v.replace(/^"|"$/g, '').replace(/\s+/g, '');
    return v;
  };

  const isLikelyBase58 = (value: string): boolean => {
    if (!value) return false;
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

    const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
    try {
      setLoading(true);

      let recipientPk: PublicKey | null = null;
      const cleaned = normalizeRecipient(recipient);
      if (isLikelyBase58(cleaned)) {
        recipientPk = new PublicKey(cleaned);
      } else {
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
        recipientPk = identity.owner;
      }

      const payer = publicKey;
      const usdcMint = new PublicKey(import.meta.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
      const payerAta = await getAssociatedTokenAddress(usdcMint, payer);

      const recipientIsOnCurve = PublicKey.isOnCurve(recipientPk!.toBytes());

      const ixs: TransactionInstruction[] = [];

      const payerAtaInfo = await connection.getAccountInfo(payerAta);
      if (!payerAtaInfo) {
        ixs.push(createAssociatedTokenAccountIdempotentInstruction(payer, payerAta, payer, usdcMint));
      }

      let destinationTokenAccount: PublicKey | null = null;

      if (recipientIsOnCurve) {
        const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPk!, true);
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
        destinationTokenAccount = recipientAta;
      } else {
        toast.message('Alıcı PDA: ATA yerine normal token hesabı oluşturuluyor…');
        const newTokenAccount = Keypair.generate();
        const rentLamports = await getMinimumBalanceForRentExemptAccount(connection);
        ixs.push(
          SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: newTokenAccount.publicKey,
            lamports: rentLamports,
            space: AccountLayout.span,
            programId: TOKEN_PROGRAM_ID,
          })
        );
        ixs.push(createInitializeAccountInstruction(newTokenAccount.publicKey, usdcMint, recipientPk!, TOKEN_PROGRAM_ID));
        destinationTokenAccount = newTokenAccount.publicKey;
        (ixs as any)._newTokenAccountSigner = newTokenAccount;
      }

      const amountU64 = Math.floor(parsedAmount * 1_000_000);
      ixs.push(createTransferInstruction(payerAta, destinationTokenAccount!, payer, amountU64));
      if (memo) {
        ixs.push(new TransactionInstruction({ keys: [], programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), data: Buffer.from(memo) }));
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: payer, blockhash, lastValidBlockHeight });
      tx.add(...ixs);

      const tmpSigner = (ixs as any)._newTokenAccountSigner as Keypair | undefined;
      if (tmpSigner) {
        tx.partialSign(tmpSigner);
      }

      toast.message('Opening wallet for signature…');
      const signed = await anchorWallet.signTransaction(tx);

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
      </div>
    </div>
  );
}
