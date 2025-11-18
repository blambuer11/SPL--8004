#!/usr/bin/env node
/**
 * Initialize all three protocol configs
 * Usage: node initialize-all-configs.js
 */

const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const DEVNET_RPC = "https://api.devnet.solana.com";

const PROGRAM_IDS = {
  ACP: "FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK",
  TAP: "DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4",
  FCP: "A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR",
};

async function initializeACP(provider) {
  console.log("\n🚀 Initializing SPL-ACP Config...");
  
  const programId = new PublicKey(PROGRAM_IDS.ACP);
  const idlPath = path.join(__dirname, "target/idl/spl_acp.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  
  // Set the program ID in IDL metadata if not present
  if (!idl.metadata) idl.metadata = {};
  idl.metadata.address = programId.toBase58();
  
  const program = new anchor.Program(idl, provider);

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );

  try {
    const configAccount = await provider.connection.getAccountInfo(configPda);
    
    if (configAccount) {
      console.log("⚠️  Config already initialized!");
      const config = await program.account.globalConfig.fetch(configPda);
      console.log(`   Authority: ${config.authority.toBase58()}`);
      console.log(`   Registration Fee: ${config.registrationFee.toNumber() / 1e9} SOL`);
      return;
    }

    const registrationFee = new anchor.BN(0.01 * 1e9);
    
    const tx = await program.methods
      .initializeConfig(provider.wallet.publicKey, registrationFee)
      .accounts({
        config: configPda,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Config initialized!");
    console.log(`   Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function initializeTAP(provider) {
  console.log("\n🚀 Initializing SPL-TAP Config...");
  
  const programId = new PublicKey(PROGRAM_IDS.TAP);
  const idlPath = path.join(__dirname, "target/idl/spl_tap.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  
  // Set the program ID in IDL metadata if not present
  if (!idl.metadata) idl.metadata = {};
  idl.metadata.address = programId.toBase58();
  
  const program = new anchor.Program(idl, provider);

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );

  try {
    const configAccount = await provider.connection.getAccountInfo(configPda);
    
    if (configAccount) {
      console.log("⚠️  Config already initialized!");
      const config = await program.account.globalConfig.fetch(configPda);
      console.log(`   Authority: ${config.authority.toBase58()}`);
      console.log(`   Min Stake: ${config.minStakeForIssuer.toNumber() / 1e9} SOL`);
      return;
    }

    const minStake = new anchor.BN(1 * 1e9);
    
    const tx = await program.methods
      .initializeConfig(provider.wallet.publicKey, minStake)
      .accounts({
        config: configPda,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Config initialized!");
    console.log(`   Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function initializeFCP(provider) {
  console.log("\n🚀 Initializing SPL-FCP Config...");
  
  const programId = new PublicKey(PROGRAM_IDS.FCP);
  const idlPath = path.join(__dirname, "target/idl/spl_fcp.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  
  // Set the program ID in IDL metadata if not present
  if (!idl.metadata) idl.metadata = {};
  idl.metadata.address = programId.toBase58();
  
  const program = new anchor.Program(idl, provider);

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );

  try {
    const configAccount = await provider.connection.getAccountInfo(configPda);
    
    if (configAccount) {
      console.log("⚠️  Config already initialized!");
      const config = await program.account.globalConfig.fetch(configPda);
      console.log(`   Authority: ${config.authority.toBase58()}`);
      console.log(`   Min Stake: ${config.minStakeForValidator.toNumber() / 1e9} SOL`);
      return;
    }

    const minStake = new anchor.BN(2 * 1e9);
    
    const tx = await program.methods
      .initializeConfig(provider.wallet.publicKey, minStake)
      .accounts({
        config: configPda,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Config initialized!");
    console.log(`   Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     SPL-X PROTOCOLS CONFIG INITIALIZATION              ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  // Load wallet
  const walletPath = path.join(process.env.HOME, "Desktop/sp8004/my-solana-keypair.json");
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  console.log(`\n📋 Wallet: ${walletKeypair.publicKey.toBase58()}`);

  // Setup connection and provider
  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL\n`);

  if (balance < 0.5 * 1e9) {
    console.log("❌ Insufficient balance! Need at least 0.5 SOL");
    process.exit(1);
  }

  // Initialize all configs
  await initializeACP(provider);
  await initializeTAP(provider);
  await initializeFCP(provider);

  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║                  🎉 ALL DONE!                          ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal Error:", error);
    process.exit(1);
  });
