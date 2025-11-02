import { useWallet } from '@solana/wallet-adapter-react';

function short(pubkey?: string | null) {
  if (!pubkey) return '';
  return `${pubkey.slice(0, 4)}…${pubkey.slice(-4)}`;
}

export function UserProfileAvatar() {
  const { publicKey } = useWallet();
  const addr = publicKey?.toBase58();
  if (!addr) return null;
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border/60 bg-white/70">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600" />
      <span className="text-sm font-medium text-foreground">{short(addr)}</span>
    </div>
  );
}
