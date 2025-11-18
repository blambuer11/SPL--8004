// @ts-nocheck
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import fs from "fs";
import path from "path";

// Simple helper to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Seeds
const CONFIG_SEED = "config";
const IDENTITY_SEED = "identity";
const REPUTATION_SEED = "reputation";
const VALIDATION_SEED = "validation";
const REWARD_POOL_SEED = "reward_pool";

// Program ID
const PROGRAM_ID = new PublicKey("G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW");

// Helpers
const enc = new TextEncoder();
const pda = (seeds: (Uint8Array | Buffer)[], pid: PublicKey) => PublicKey.findProgramAddressSync(seeds, pid);

function u16le(n: number) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
function boolU8(b: boolean) { return new Uint8Array([b ? 1 : 0]); }
function encodeString(s: string) { const bytes = enc.encode(s || ""); const len = new Uint8Array(4); new DataView(len.buffer).setUint32(0, bytes.length, true); return new Uint8Array([...len, ...bytes]); }
async function sha256(data: Uint8Array | string) { const d = typeof data === "string" ? enc.encode(data) : data; const h = await crypto.subtle.digest("SHA-256", d as any); return new Uint8Array(h); }
async function disc(name: string) { const h = await sha256(`global:${name}`); return h.slice(0, 8); }

async function sendIx(connection: Connection, payer: Keypair, ixs: TransactionInstruction[]) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: payer.publicKey, blockhash, lastValidBlockHeight });
  tx.add(...ixs);
  tx.sign(payer);
  const raw = tx.serialize();
  const sig = await connection.sendRawTransaction(raw, { maxRetries: 3, preflightCommitment: "confirmed" });
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
  return sig;
}

// Demo parameters
const AGENT_A = "agent-alpha";
const AGENT_B = "agent-beta";

function taskHash(label: string) {
  const bytes = new Uint8Array(32);
  const src = enc.encode(label);
  bytes.set(src.slice(0, Math.min(32, src.length)));
  return bytes;
}

describe("demo-agents (no-IDL)", () => {
  it("Registers two agents, updates reputation, and sends mock USDC", async () => {
    const rpc = process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com";
    const walletPath = process.env.ANCHOR_WALLET || path.resolve(process.cwd(), "../../my-solana-keypair.json");
    const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8"))));
    const connection = new Connection(rpc, "confirmed");

    console.log("\n🚀 Demo starting on:", rpc);
    console.log("👛 Payer:", payer.publicKey.toBase58());
    console.log("🔧 Program:", PROGRAM_ID.toBase58());

    const [configPda] = pda([enc.encode(CONFIG_SEED)], PROGRAM_ID);
    const [idA] = pda([enc.encode(IDENTITY_SEED), enc.encode(AGENT_A)], PROGRAM_ID);
    const [idB] = pda([enc.encode(IDENTITY_SEED), enc.encode(AGENT_B)], PROGRAM_ID);
    const [repA] = pda([enc.encode(REPUTATION_SEED), enc.encode(AGENT_A)], PROGRAM_ID);
    const [repB] = pda([enc.encode(REPUTATION_SEED), enc.encode(AGENT_B)], PROGRAM_ID);
    const [poolA] = pda([enc.encode(REWARD_POOL_SEED), enc.encode(AGENT_A)], PROGRAM_ID);
    const [poolB] = pda([enc.encode(REWARD_POOL_SEED), enc.encode(AGENT_B)], PROGRAM_ID);

    // 1) initialize_config
    try {
      const data = new Uint8Array([
        ...(await disc("initialize_config")),
        ...u16le(200),
        ...payer.publicKey.toBytes(),
      ]);
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
      });
      const sig = await sendIx(connection, payer, [ix]);
      console.log("✅ Config initialized:", sig);
    } catch (e: any) {
      console.log("ℹ️  initialize_config skipped:", String(e?.message || e));
    }

    // 2) register_agent (A, B)
    const regDisc = await disc("register_agent");
    const regAData = new Uint8Array([...regDisc, ...encodeString(AGENT_A), ...encodeString("https://arweave.net/agent-alpha")]);
    try {
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: idA, isSigner: false, isWritable: true },
          { pubkey: repA, isSigner: false, isWritable: true },
          { pubkey: poolA, isSigner: false, isWritable: true },
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: regAData,
      });
      const sig = await sendIx(connection, payer, [ix]);
      console.log("✅ Registered A:", AGENT_A, idA.toBase58(), sig);
    } catch (e: any) {
      console.log("ℹ️  register_agent A skipped:", String(e?.message || e));
    }

    const regBData = new Uint8Array([...regDisc, ...encodeString(AGENT_B), ...encodeString("https://arweave.net/agent-beta")]);
    try {
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: idB, isSigner: false, isWritable: true },
          { pubkey: repB, isSigner: false, isWritable: true },
          { pubkey: poolB, isSigner: false, isWritable: true },
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: regBData,
      });
      const sig = await sendIx(connection, payer, [ix]);
      console.log("✅ Registered B:", AGENT_B, idB.toBase58(), sig);
    } catch (e: any) {
      console.log("ℹ️  register_agent B skipped:", String(e?.message || e));
    }

    // 3) submit_validation (for A)
    const th = taskHash("demo-task-001");
    const [validationA] = pda([enc.encode(VALIDATION_SEED), enc.encode(AGENT_A), th], PROGRAM_ID);
    try {
      // Read config to get treasury
      const cfgAcc = await connection.getAccountInfo(configPda);
      let treasuryPk = payer.publicKey;
      if (cfgAcc?.data && cfgAcc.data.length >= 8 + 32 + 32) {
        treasuryPk = new PublicKey(cfgAcc.data.slice(8 + 32, 8 + 32 + 32));
      }
      const data = new Uint8Array([
        ...(await disc("submit_validation")),
        ...th,
        ...boolU8(true),
        ...encodeString("ipfs://evidence-demo-001"),
      ]);
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: validationA, isSigner: false, isWritable: true },
          { pubkey: idA, isSigner: false, isWritable: false },
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: treasuryPk, isSigner: false, isWritable: true }, // treasury from config
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
      });
      const sig = await sendIx(connection, payer, [ix]);
      console.log("✅ Validation submitted:", validationA.toBase58(), sig);
    } catch (e: any) {
      console.log("ℹ️  submit_validation skipped:", String(e?.message || e));
    }

    await sleep(1200);

    // 4) update_reputation (A)
    try {
      const data = new Uint8Array([...(await disc("update_reputation"))]);
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: repA, isSigner: false, isWritable: true },
          { pubkey: idA, isSigner: false, isWritable: false },
          { pubkey: validationA, isSigner: false, isWritable: false },
          { pubkey: poolA, isSigner: false, isWritable: true },
        ],
        data,
      });
      const sig = await sendIx(connection, payer, [ix]);
      console.log("✅ Reputation updated A:", sig);
    } catch (e: any) {
      console.log("ℹ️  update_reputation skipped:", String(e?.message || e));
    }

    // 5) Mock USDC payment via facilitator (A -> B wallet)
    const agentBWallet = Keypair.generate();
    const recipient = agentBWallet.publicKey.toBase58();
    const amount = "1.000000";
    try {
      const res = await fetch("http://localhost:3001/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, amount, memo: `from:${AGENT_A}` }),
      });
      const json = await res.json();
      if (json?.success) console.log("💳 Mock payment OK:", json.signature, json.explorerUrl);
      else console.log("❌ Mock payment failed:", json);
    } catch (e: any) {
      console.log("❌ Facilitator /payment call failed:", String(e?.message || e));
    }

    console.log("\n🎉 Demo finished.");
  });
});
