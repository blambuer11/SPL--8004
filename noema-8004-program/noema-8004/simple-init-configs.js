#!/usr/bin/env node
/**
 * Simple config initialization using web3.js
 * Usage: node simple-init-configs.js
 */

const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");
const borsh = require("borsh");

const DEVNET_RPC = "https://api.devnet.solana.com";

const PROGRAM_IDS = {
  ACP: new PublicKey("FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK"),
  TAP: new PublicKey("DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4"),
  FCP: new PublicKey("A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR"),
};

// Simple instruction discriminator hash
function instructionDiscriminator(name) {
  const hash = require("crypto").createHash("sha256");
  hash.update(`global:${name}`);
  return Buffer.from(hash.digest()).slice(0, 8);
}

async function initializeConfig(connection, wallet, programId, protocolName, params) {
  console.log(`\n🚀 Initializing ${protocolName} Config...`);

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );

  try {
    // Check if already initialized
    const configAccount = await connection.getAccountInfo(configPda);
    if (configAccount) {
      console.log("⚠️  Config already initialized!");
      console.log(`   Config PDA: ${configPda.toBase58()}`);
      return;
    }

    // Create instruction data
    const discriminator = instructionDiscriminator("initialize_config");
    const authorityBuffer = wallet.publicKey.toBuffer();
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(BigInt(params.amount));
    
    const data = Buffer.concat([
      discriminator,
      authorityBuffer,
      amountBuffer
    ]);

    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId,
      data,
    });

    // Send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await connection.sendTransaction(transaction, [wallet], {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    await connection.confirmTransaction(signature, "confirmed");

    console.log("✅ Config initialized!");
    console.log(`   Config PDA: ${configPda.toBase58()}`);
    console.log(`   Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.error("   Program logs:");
      error.logs.forEach(log => console.error(`   ${log}`));
    }
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

  // Setup connection
  const connection = new Connection(DEVNET_RPC, "confirmed");

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL\n`);

  if (balance < 0.5 * 1e9) {
    console.log("❌ Insufficient balance! Need at least 0.5 SOL");
    process.exit(1);
  }

  // Initialize all configs
  await initializeConfig(connection, walletKeypair, PROGRAM_IDS.ACP, "SPL-ACP", {
    amount: 0.01 * 1e9 // registration fee
  });

  await initializeConfig(connection, walletKeypair, PROGRAM_IDS.TAP, "SPL-TAP", {
    amount: 1 * 1e9 // min stake
  });

  await initializeConfig(connection, walletKeypair, PROGRAM_IDS.FCP, "SPL-FCP", {
    amount: 2 * 1e9 // min stake
  });

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
