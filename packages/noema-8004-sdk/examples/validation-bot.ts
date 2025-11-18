/**
 * Example: Validation Bot
 * 
 * This agent autonomously submits validations to a protected API
 * Automatically pays for each submission
 */

import { createAgent } from '@spl-8004/sdk';
import { PublicKey } from '@solana/web3.js';

// Configuration
const AGENT_ID = 'validation-bot-001';
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY!;
const VALIDATOR_API = 'https://validator.spl8004.io';
const TARGET_API = 'https://api.example.com';
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// Validation interval (1 minute)
const INTERVAL = 60 * 1000;

async function main() {
  // Initialize agent
  const agent = createAgent({
    agentId: AGENT_ID,
    privateKey: AGENT_PRIVATE_KEY,
    network: 'devnet',
    validatorApiUrl: VALIDATOR_API,
  });

  console.log('🤖 Validation Bot Started');
  console.log(`📍 Agent: ${agent.getPublicKey().toString()}`);

  // Check initial balance
  const usdcBalance = await agent.getUsdcBalance(USDC_MINT);
  console.log(`💰 USDC Balance: ${usdcBalance}`);

  if (usdcBalance < 1) {
    console.error('❌ Insufficient USDC balance! Please fund the agent.');
    process.exit(1);
  }

  // Get identity
  const identity = await agent.getIdentity();
  console.log(`🆔 Identity: ${identity.identityPda}`);
  console.log(`📊 Reputation: ${identity.reputation}`);
  console.log(`💸 Total Spent: ${identity.totalSpent} USDC\n`);

  // Main loop
  let iteration = 0;
  while (true) {
    iteration++;
    console.log(`\n🔄 Iteration ${iteration} - ${new Date().toISOString()}`);

    try {
      // 1. Generate validation data
      console.log('📝 Generating validation...');
      const validationData = await generateValidation();

      // 2. Submit to protected endpoint (auto-pays if needed)
      console.log('📤 Submitting validation...');
      const result = await agent.accessProtectedEndpoint(
        `${TARGET_API}/api/validations/submit`,
        {
          method: 'POST',
          body: validationData,
        }
      );

      console.log(`✅ Validation submitted: ${result.ref}`);

      // 3. Update identity info
      const updatedIdentity = await agent.getIdentity();
      console.log(`📊 Updated Reputation: ${updatedIdentity.reputation} (+${updatedIdentity.reputation - identity.reputation})`);
      console.log(`💸 Total Spent: ${updatedIdentity.totalSpent} USDC`);

      // 4. Check balance
      const currentBalance = await agent.getUsdcBalance(USDC_MINT);
      console.log(`💰 Current Balance: ${currentBalance} USDC`);

      if (currentBalance < 0.1) {
        console.warn('⚠️  Low balance warning! Please refill soon.');
      }

    } catch (error: any) {
      console.error(`❌ Error:`, error.message);
    }

    // Wait before next iteration
    console.log(`⏳ Waiting ${INTERVAL / 1000}s for next iteration...`);
    await new Promise(resolve => setTimeout(resolve, INTERVAL));
  }
}

/**
 * Generate validation data
 * Replace with your actual validation logic
 */
async function generateValidation() {
  // Example: Validate some external data
  const data = {
    task_hash: generateRandomHash(),
    approved: Math.random() > 0.1, // 90% approval rate
    evidence_uri: `https://evidence.example.com/${Date.now()}`,
    timestamp: Date.now(),
  };

  return data;
}

function generateRandomHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
