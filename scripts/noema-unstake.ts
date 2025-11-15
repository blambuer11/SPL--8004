import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createNoemaStakingClient } from "../src/lib/noema/noema-staking-client";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Load environment variables
config();

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
  const keypairPath = process.env.WALLET_KEYPAIR || path.join(process.env.HOME || ".", ".config", "solana", "id.json");
  const decimals = Number(process.env.NOEMA_DECIMALS || 9);
  const amountTokens = Number(process.env.NOEMA_AMOUNT || 1);
  const instant = (process.env.NOEMA_INSTANT || "false").toLowerCase() === "true";
  if (!Number.isFinite(amountTokens) || amountTokens <= 0) throw new Error("Set NOEMA_AMOUNT (>0)");
  const amountRaw = BigInt(Math.floor(amountTokens * 10 ** decimals));

  const secret = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const kp = Keypair.fromSecretKey(Uint8Array.from(secret));

  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new Wallet(kp);
  const provider = new AnchorProvider(connection, wallet, {});
  
  const programId = new PublicKey(process.env.VITE_NOEMA_STAKING_PROGRAM_ID!);
  const stakeMint = new PublicKey(process.env.VITE_NOEMA_MINT!);
  
  const client = createNoemaStakingClient(provider.connection as unknown as Connection, wallet, programId, stakeMint);

  if (instant) {
     console.log("Getting config to find treasury address...");
     const cfg = await client.getConfigAccount();
     if (!cfg) throw new Error("Config not found");
    
     console.log("Config treasury:", cfg.treasury.toBase58());
     console.log("Config stake mint:", cfg.stakeMint.toBase58());
    
    // Treasury in config is actually an ATA address (off-curve), not a regular public key
    // We need to use it directly as the treasury ATA
    const treasuryAta = cfg.treasury;
     console.log("Treasury ATA:", treasuryAta.toBase58());
    
     const sig = await client.instantUnstake(amountRaw, treasuryAta);
    console.log("Instant Unstake tx:", sig);
  } else {
    const sig = await client.unstake(amountRaw);
    console.log("Unstake tx:", sig);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
