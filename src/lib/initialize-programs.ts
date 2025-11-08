/**
 * Initialize all SPL-X programs (one-time setup)
 * Run this once to create config accounts for all layers
 */

import { Connection, PublicKey, SystemProgram, TransactionInstruction, Transaction, Keypair } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { SPL_TAP_PROGRAM_ID, SPL_FCP_PROGRAM_ID, SPL_ACP_PROGRAM_ID } from "./spl-x-constants";

// Helper to get discriminator
async function discriminator(name: string): Promise<Uint8Array> {
  const preimage = `global:${name}`;
  const encoded = new TextEncoder().encode(preimage);
  const hash = await crypto.subtle.digest("SHA-256", encoded as unknown as ArrayBuffer);
  return new Uint8Array(hash).slice(0, 8);
}

// Helper to find config PDA
function findConfigPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );
}

/**
 * Initialize SPL-TAP (Layer 2)
 */
export async function initializeTAP(connection: Connection, wallet: AnchorWallet): Promise<string> {
  const [configPda] = findConfigPda(SPL_TAP_PROGRAM_ID);
  console.log("Config PDA:", configPda.toBase58());
  console.log("Program ID:", SPL_TAP_PROGRAM_ID.toBase58());
  
  // Check if already initialized
  const accountInfo = await connection.getAccountInfo(configPda);
  if (accountInfo) {
    console.log("✅ SPL-TAP already initialized");
    return "Already initialized";
  }

  console.log("Creating initialize instruction...");
  
  // Build instruction: initializeConfig(authority: PublicKey, minStakeForIssuer: u64)
  const disc = await discriminator("initializeConfig");
  console.log("Discriminator:", Buffer.from(disc).toString('hex'));
  
  const data = Buffer.alloc(8 + 32 + 8); // disc + pubkey + u64
  
  disc.forEach((byte, i) => data[i] = byte);
  wallet.publicKey.toBuffer().copy(data, 8); // authority
  data.writeBigUInt64LE(BigInt(1_000_000_000), 40); // 1 SOL min stake
  
  console.log("Instruction data length:", data.length);

  const ix = new TransactionInstruction({
    programId: SPL_TAP_PROGRAM_ID,
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  console.log("Sending transaction...");
  return await sendTransaction(connection, wallet, [ix]);
}

/**
 * Initialize SPL-FCP (Layer 3)
 */
export async function initializeFCP(connection: Connection, wallet: AnchorWallet): Promise<string> {
  const [configPda] = findConfigPda(SPL_FCP_PROGRAM_ID);
  
  const accountInfo = await connection.getAccountInfo(configPda);
  if (accountInfo) {
    console.log("✅ SPL-FCP already initialized");
    return "Already initialized";
  }

  // Build instruction: initializeConfig(authority: PublicKey, minStakeForValidator: u64)
  const disc = await discriminator("initializeConfig");
  const data = Buffer.alloc(8 + 32 + 8); // disc + pubkey + u64
  
  disc.forEach((byte, i) => data[i] = byte);
  wallet.publicKey.toBuffer().copy(data, 8); // authority
  data.writeBigUInt64LE(BigInt(1_000_000_000), 40); // 1 SOL min stake for validators

  const ix = new TransactionInstruction({
    programId: SPL_FCP_PROGRAM_ID,
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  return await sendTransaction(connection, wallet, [ix]);
}

/**
 * Initialize SPL-ACP (Layer 5)
 */
export async function initializeACP(connection: Connection, wallet: AnchorWallet): Promise<string> {
  const [configPda] = findConfigPda(SPL_ACP_PROGRAM_ID);
  
  const accountInfo = await connection.getAccountInfo(configPda);
  if (accountInfo) {
    console.log("✅ SPL-ACP already initialized");
    return "Already initialized";
  }

  // Build instruction: initializeConfig(authority: PublicKey, registrationFee: u64)
  const disc = await discriminator("initializeConfig");
  const data = Buffer.alloc(8 + 32 + 8); // disc + pubkey + u64
  
  disc.forEach((byte, i) => data[i] = byte);
  wallet.publicKey.toBuffer().copy(data, 8); // authority
  data.writeBigUInt64LE(BigInt(100_000_000), 40); // 0.1 SOL registration fee

  const ix = new TransactionInstruction({
    programId: SPL_ACP_PROGRAM_ID,
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  return await sendTransaction(connection, wallet, [ix]);
}

/**
 * Initialize all programs at once
 */
export async function initializeAllPrograms(connection: Connection, wallet: AnchorWallet): Promise<void> {
  console.log("🚀 Initializing all SPL-X programs...");
  console.log("Wallet:", wallet.publicKey.toBase58());
  
  try {
    console.log("\n--- Initializing SPL-TAP (Layer 2) ---");
    const tap = await initializeTAP(connection, wallet);
    console.log("✅ Layer 2 (TAP):", tap);
    
    console.log("\n--- Initializing SPL-FCP (Layer 3) ---");
    const fcp = await initializeFCP(connection, wallet);
    console.log("✅ Layer 3 (FCP):", fcp);
    
    console.log("\n--- Initializing SPL-ACP (Layer 5) ---");
    const acp = await initializeACP(connection, wallet);
    console.log("✅ Layer 5 (ACP):", acp);
    
    console.log("\n🎉 All programs initialized successfully!");
  } catch (error) {
    console.error("\n❌ Initialization failed:");
    console.error(error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    throw error;
  }
}

// Helper to send transaction
async function sendTransaction(
  connection: Connection,
  wallet: AnchorWallet,
  instructions: TransactionInstruction[]
): Promise<string> {
  try {
    console.log("Getting latest blockhash...");
    const { blockhash } = await connection.getLatestBlockhash();
    
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    instructions.forEach((ix) => transaction.add(ix));
    
    console.log("Signing transaction...");
    const signedTx = await wallet.signTransaction(transaction);
    
    console.log("Sending raw transaction...");
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed"
    });
    
    console.log("Transaction signature:", signature);
    console.log("Confirming transaction...");
    
    await connection.confirmTransaction(signature, "confirmed");
    console.log("✅ Transaction confirmed!");
    
    return signature;
  } catch (error) {
    console.error("❌ Transaction error:");
    console.error(error);
    
    // Parse Anchor error if available
    if (error instanceof Error && error.message) {
      console.error("Error message:", error.message);
      
      // Try to extract program logs
      if (error && typeof error === 'object' && 'logs' in error) {
        console.error("Program logs:", (error as { logs: string[] }).logs);
      }
    }
    
    throw error;
  }
}
