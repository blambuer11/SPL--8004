/**
 * Initialize SPL-ACP Config
 * Run: cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/spl-8004 && npx ts-node ../spl-acp/scripts/initialize-acp.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import path from "path";

const DEVNET_RPC = "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK");

async function main() {
  console.log("🚀 Initializing SPL-ACP Config...\n");

  // Load wallet
  const walletPath = path.join(
    process.env.HOME!,
    "Desktop/sp8004/my-solana-keypair.json"
  );
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // Setup connection and provider
  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = new Wallet(walletKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Load IDL and create program
  const idlPath = path.join(__dirname, "../../spl-8004/target/idl/spl_acp.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const program = new Program(idl, PROGRAM_ID, provider);

  // Derive config PDA
  const [configPda, configBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  console.log("📋 Configuration:");
  console.log(`   Program ID: ${program.programId.toBase58()}`);
  console.log(`   Config PDA: ${configPda.toBase58()}`);
  console.log(`   Authority: ${wallet.publicKey.toBase58()}`);
  console.log(`   Registration Fee: 0.01 SOL\n`);

  try {
    // Check if config already exists
    const configAccount = await connection.getAccountInfo(configPda);
    
    if (configAccount) {
      console.log("⚠️  Config already initialized!");
      console.log("   Fetching current config...\n");
      
      const config = await program.account.globalConfig.fetch(configPda);
      console.log("✅ Current Config:");
      console.log(`   Authority: ${config.authority.toBase58()}`);
      console.log(`   Registration Fee: ${config.registrationFee.toNumber() / 1e9} SOL`);
      console.log(`   Total Capabilities: ${config.totalCapabilities.toNumber()}`);
      return;
    }

    // Initialize config
    console.log("📝 Sending initialize_config transaction...");
    
    const registrationFee = new anchor.BN(0.01 * 1e9); // 0.01 SOL
    
    const tx = await program.methods
      .initializeConfig(wallet.publicKey, registrationFee)
      .accounts({
        config: configPda,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Config initialized successfully!");
    console.log(`   Transaction: ${tx}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);

    // Verify initialization
    const config = await program.account.globalConfig.fetch(configPda);
    console.log("✅ Verified Config:");
    console.log(`   Authority: ${config.authority.toBase58()}`);
    console.log(`   Registration Fee: ${config.registrationFee.toNumber() / 1e9} SOL`);
    console.log(`   Total Capabilities: ${config.totalCapabilities.toNumber()}`);
    console.log(`   Bump: ${config.bump}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
