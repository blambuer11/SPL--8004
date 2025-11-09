import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW');

const IDENTITY_SEED = "identity";
const REPUTATION_SEED = "reputation";
const REWARD_POOL_SEED = "reward_pool";

function testPDADerivation(agentId: string) {
  console.log('\n🔍 Testing PDA derivation for:', agentId);
  console.log('Agent ID length:', agentId.length);
  console.log('Agent ID bytes:', Buffer.from(agentId).toString('hex'));
  
  const enc = new TextEncoder();
  
  // Identity
  const [identityPda, identityBump] = PublicKey.findProgramAddressSync(
    [enc.encode(IDENTITY_SEED), enc.encode(agentId)],
    PROGRAM_ID
  );
  console.log('\nIdentity PDA:', identityPda.toBase58());
  console.log('Identity bump:', identityBump);
  
  // Reputation
  const [reputationPda, reputationBump] = PublicKey.findProgramAddressSync(
    [enc.encode(REPUTATION_SEED), enc.encode(agentId)],
    PROGRAM_ID
  );
  console.log('\nReputation PDA:', reputationPda.toBase58());
  console.log('Reputation bump:', reputationBump);
  
  // Reward Pool
  const [rewardPoolPda, rewardPoolBump] = PublicKey.findProgramAddressSync(
    [enc.encode(REWARD_POOL_SEED), enc.encode(agentId)],
    PROGRAM_ID
  );
  console.log('\nReward Pool PDA:', rewardPoolPda.toBase58());
  console.log('Reward Pool bump:', rewardPoolBump);
  
  // Check seeds
  console.log('\n📋 Seed breakdown:');
  console.log('REPUTATION_SEED bytes:', Buffer.from(REPUTATION_SEED).toString('hex'));
  console.log('agent_id bytes:', Buffer.from(agentId).toString('hex'));
}

// Test with common agent IDs
console.log('='.repeat(60));
testPDADerivation('test-agent-001');
console.log('='.repeat(60));
testPDADerivation('my-agent');
console.log('='.repeat(60));

// The error showed these addresses:
console.log('\n❌ Error from logs:');
console.log('Program expected (Left):', 'AyVBo2SkwtDjvbZX3Vc1hiG5kuogzqu5WardPqLHfmE7');
console.log('Client sent (Right):', '13AZ62e4TSUtuNhde88MxMs8HvwbjLYgGBZC1v52ZG2z');
console.log('\nLet\'s reverse-engineer what agent_id produces the "Left" address...');
