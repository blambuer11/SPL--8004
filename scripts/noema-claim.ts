import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createNoemaStakingClient } from "../src/lib/noema/noema-staking-client";

// Load environment variables
config();

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
  const keypairPath = process.env.WALLET_KEYPAIR || path.join(process.env.HOME || ".", ".config", "solana", "id.json");

  const secret = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const kp = Keypair.fromSecretKey(Uint8Array.from(secret));

  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new Wallet(kp);
  const provider = new AnchorProvider(connection, wallet, {});
  
  const programId = new PublicKey(process.env.VITE_NOEMA_STAKING_PROGRAM_ID!);
  const stakeMint = new PublicKey(process.env.VITE_NOEMA_MINT!);
  
  const client = createNoemaStakingClient(provider.connection as unknown as Connection, wallet, programId, stakeMint);

  const sig = await client.claimRewards();
  console.log("Claim tx:", sig);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
