import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Build a Solana Explorer transaction URL based on current cluster (default devnet)
export function getExplorerTxUrl(signature: string): string {
  const cluster = (import.meta.env.VITE_SOLANA_NETWORK as string | undefined) || 'devnet';
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}
