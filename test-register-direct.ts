import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import * as fs from 'fs';

const keypairData = JSON.parse(fs.readFileSync('/Users/bl10buer/Desktop/sp8004/my-solana-keypair.json', 'utf-8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const PROGRAM_ID = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');

async function sha256(data: Uint8Array | string): Promise<Uint8Array> {
  const enc = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await (globalThis.crypto as Crypto).subtle.digest("SHA-256", enc);
  return new Uint8Array(hash);
}

async function discriminator(name: string): Promise<Uint8Array> {
  const h = await sha256(`global:${name}`);
  return h.slice(0, 8);
}

function encodeString(str: string): Uint8Array {
  const bytes = new TextEncoder().encode(str);
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, bytes.length, true);
  return new Uint8Array([...len, ...bytes]);
}

async function testRegisterAgent() {
  const agentId = `fresh-agent-${Date.now()}`;
  const metadataUri = 'https://test.com/metadata.json';
  
  console.log('🧪 Testing Register Agent with fresh ID:', agentId);
  
  const enc = new TextEncoder();
  const [identityPda] = PublicKey.findProgramAddressSync(
    [enc.encode('identity'), enc.encode(agentId)],
    PROGRAM_ID
  );
  const [reputationPda] = PublicKey.findProgramAddressSync(
    [enc.encode('reputation'), enc.encode(agentId)],
    PROGRAM_ID
  );
  const [rewardPoolPda] = PublicKey.findProgramAddressSync(
    [enc.encode('reward_pool'), enc.encode(agentId)],
    PROGRAM_ID
  );
  const [configPda] = PublicKey.findProgramAddressSync(
    [enc.encode('config')],
    PROGRAM_ID
  );
  
  console.log('\n📍 PDAs:');
  console.log('Identity:', identityPda.toBase58());
  console.log('Reputation:', reputationPda.toBase58());
  console.log('Reward Pool:', rewardPoolPda.toBase58());
  console.log('Config:', configPda.toBase58());
  
  // Check if any already exist
  const [idInfo, repInfo, poolInfo] = await Promise.all([
    connection.getAccountInfo(identityPda),
    connection.getAccountInfo(reputationPda),
    connection.getAccountInfo(rewardPoolPda),
  ]);
  
  if (idInfo || repInfo || poolInfo) {
    console.log('\n❌ One or more accounts already exist!');
    if (idInfo) console.log('   - Identity exists');
    if (repInfo) console.log('   - Reputation exists');
    if (poolInfo) console.log('   - Reward Pool exists');
    return;
  }
  
  console.log('\n✅ All accounts are free');
  
  // Build instruction
  const disc = await discriminator('register_agent');
  const data = new Uint8Array([
    ...disc,
    ...encodeString(agentId),
    ...encodeString(metadataUri),
  ]);
  
  console.log('\n📦 Instruction data:');
  console.log('Discriminator:', Buffer.from(disc).toString('hex'));
  console.log('Agent ID encoded:', Buffer.from(encodeString(agentId)).toString('hex'));
  console.log('Total data length:', data.length, 'bytes');
  
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: identityPda, isSigner: false, isWritable: true },
      { pubkey: reputationPda, isSigner: false, isWritable: true },
      { pubkey: rewardPoolPda, isSigner: false, isWritable: true },
      { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
  
  console.log('\n🚀 Sending transaction...');
  
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction();
    tx.feePayer = keypair.publicKey;
    tx.recentBlockhash = blockhash;
    tx.add(ix);
    tx.sign(keypair);
    
    // Simulate first
    console.log('⏳ Simulating...');
    const simulation = await connection.simulateTransaction(tx);
    
    if (simulation.value.err) {
      console.log('\n❌ Simulation failed:');
      console.log('Error:', simulation.value.err);
      console.log('\nLogs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
      return;
    }
    
    console.log('✅ Simulation success!');
    console.log('\n📄 Logs:');
    simulation.value.logs?.forEach(log => console.log('  ', log));
    
    // Send for real
    console.log('\n📤 Sending for real...');
    const sig = await connection.sendRawTransaction(tx.serialize());
    console.log('✅ Transaction sent:', sig);
    
    await connection.confirmTransaction(sig, 'confirmed');
    console.log('✅ Transaction confirmed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testRegisterAgent().catch(console.error);
