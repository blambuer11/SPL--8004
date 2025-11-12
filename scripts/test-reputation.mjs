import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const DEFAULT_PROGRAM_ID = 'G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW';

function findPda(programId, seeds) {
  return PublicKey.findProgramAddressSync(seeds, programId);
}

async function main() {
  const AGENT_ID = process.env.AGENT_ID || 'trading-bot-001';
  const RPC = process.env.RPC || process.env.VITE_RPC_ENDPOINT || clusterApiUrl('devnet');

  const connection = new Connection(RPC, 'confirmed');
  const programId = new PublicKey(process.env.VITE_PROGRAM_ID || DEFAULT_PROGRAM_ID);

  console.log('RPC:', RPC);
  console.log('Program ID:', programId.toBase58());
  console.log('Agent ID:', AGENT_ID);

  const enc = new TextEncoder();
  const [identityPda] = findPda(programId, [enc.encode('identity'), enc.encode(AGENT_ID)]);
  const idInfo = await connection.getAccountInfo(identityPda);
  if (!idInfo) {
    console.log('❌ Identity not found for agent:', AGENT_ID);
    process.exit(0);
  }
  const owner = new PublicKey(idInfo.data.slice(8, 40));
  console.log('✅ Identity PDA:', identityPda.toBase58());
  console.log('   Owner:', owner.toBase58());

  const [reputationPda] = findPda(programId, [enc.encode('reputation'), enc.encode(AGENT_ID)]);
  const repInfo = await connection.getAccountInfo(reputationPda);
  if (!repInfo) {
    console.log('❌ Reputation not found');
    process.exit(0);
  }
  const view = new DataView(repInfo.data.buffer, repInfo.data.byteOffset, repInfo.data.byteLength);
  const score = Number(view.getBigUint64(40, true));
  const totalTasks = Number(view.getBigUint64(48, true));
  const successfulTasks = Number(view.getBigUint64(56, true));
  const failedTasks = Number(view.getBigUint64(64, true));
  console.log('✅ Reputation PDA:', reputationPda.toBase58());
  console.log('   Score:', score);
  console.log('   Totals:', { totalTasks, successfulTasks, failedTasks });
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
