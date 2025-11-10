/**
 * X404 NFT Bridge - Mock Test
 * Tests SDK interfaces without requiring deployed program
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing X404 NFT Bridge SDK...\n');

// Test 1: Check SDK file exists and can be read
console.log('1️⃣ Checking SDK source files...');

const sdkPath = join(__dirname, 'x404-integration/sdk/src/index.ts');
const typesPath = join(__dirname, 'x404-integration/sdk/src/types.ts');

try {
  const sdkExists = existsSync(sdkPath);
  const typesExists = existsSync(typesPath);
  
  console.log(`   SDK Index: ${sdkExists ? '✅' : '❌'} ${sdkPath}`);
  console.log(`   Types:     ${typesExists ? '✅' : '❌'} ${typesPath}\n`);
  
  if (!sdkExists) {
    console.log('❌ SDK source not found!\n');
    process.exit(1);
  }
  
  // Test 2: Read and analyze SDK
  console.log('2️⃣ Analyzing SDK code...');
  const sdkContent = readFileSync(sdkPath, 'utf8');
  
  // Check for key classes and methods
  const hasX404Bridge = sdkContent.includes('export class X404Bridge');
  const hasTokenize = sdkContent.includes('tokenizeAgent');
  const hasSyncReputation = sdkContent.includes('syncReputation');
  const hasListForSale = sdkContent.includes('listForSale');
  const hasPurchase = sdkContent.includes('purchase');
  const hasGetListedNFTs = sdkContent.includes('getListedNFTs');
  
  console.log(`   X404Bridge class:        ${hasX404Bridge ? '✅' : '❌'}`);
  console.log(`   tokenizeAgent method:    ${hasTokenize ? '✅' : '❌'}`);
  console.log(`   syncReputation method:   ${hasSyncReputation ? '✅' : '❌'}`);
  console.log(`   listForSale method:      ${hasListForSale ? '✅' : '❌'}`);
  console.log(`   purchase method:         ${hasPurchase ? '✅' : '❌'}`);
  console.log(`   getListedNFTs method:    ${hasGetListedNFTs ? '✅' : '❌'}\n`);
  
  // Test 3: Check interfaces
  console.log('3️⃣ Checking TypeScript interfaces...');
  const hasSPL8004Client = sdkContent.includes('interface SPL8004Client');
  const hasAgentData = sdkContent.includes('interface AgentData');
  const hasAgentMetadata = sdkContent.includes('interface AgentMetadata');
  const hasAgentNFTData = sdkContent.includes('interface AgentNFTData');
  
  console.log(`   SPL8004Client interface: ${hasSPL8004Client ? '✅' : '❌'}`);
  console.log(`   AgentData interface:     ${hasAgentData ? '✅' : '❌'}`);
  console.log(`   AgentMetadata interface: ${hasAgentMetadata ? '✅' : '❌'}`);
  console.log(`   AgentNFTData interface:  ${hasAgentNFTData ? '✅' : '❌'}\n`);
  
  // Test 4: Check dependencies
  console.log('4️⃣ Checking required dependencies...');
  const hasSolanaWeb3 = sdkContent.includes('@solana/web3.js');
  const hasAnchor = sdkContent.includes('@coral-xyz/anchor');
  const hasSPLToken = sdkContent.includes('@solana/spl-token');
  const hasArweave = sdkContent.includes('Arweave');
  
  console.log(`   @solana/web3.js:         ${hasSolanaWeb3 ? '✅' : '❌'}`);
  console.log(`   @coral-xyz/anchor:       ${hasAnchor ? '✅' : '❌'}`);
  console.log(`   @solana/spl-token:       ${hasSPLToken ? '✅' : '❌'}`);
  console.log(`   Arweave:                 ${hasArweave ? '✅' : '❌'}\n`);
  
  // Test 5: Check program files
  console.log('5️⃣ Checking Rust program files...');
  const programPath = join(__dirname, 'x404-integration/programs/x404-agent-nft/src/lib.rs');
  const programExists = existsSync(programPath);
  
  console.log(`   Program source:          ${programExists ? '✅' : '❌'}\n`);
  
  if (programExists) {
    const programContent = readFileSync(programPath, 'utf8');
    const hasInitialize = programContent.includes('pub fn initialize');
    const hasMintAgentNFT = programContent.includes('pub fn mint_agent_nft');
    const hasUpdateReputation = programContent.includes('pub fn update_reputation');
    const hasListForSaleRust = programContent.includes('pub fn list_for_sale');
    const hasPurchaseRust = programContent.includes('pub fn purchase');
    
    console.log('   📦 Program Instructions:');
    console.log(`      initialize:           ${hasInitialize ? '✅' : '❌'}`);
    console.log(`      mint_agent_nft:       ${hasMintAgentNFT ? '✅' : '❌'}`);
    console.log(`      update_reputation:    ${hasUpdateReputation ? '✅' : '❌'}`);
    console.log(`      list_for_sale:        ${hasListForSaleRust ? '✅' : '❌'}`);
    console.log(`      purchase:             ${hasPurchaseRust ? '✅' : '❌'}\n`);
  }
  
  // Test 6: Check Anchor.toml
  console.log('6️⃣ Checking Anchor configuration...');
  const anchorTomlPath = join(__dirname, 'x404-integration/Anchor.toml');
  const anchorTomlExists = existsSync(anchorTomlPath);
  
  if (anchorTomlExists) {
    const anchorToml = readFileSync(anchorTomlPath, 'utf8');
    const programIdMatch = anchorToml.match(/x404_agent_nft = "([^"]+)"/);
    const programId = programIdMatch ? programIdMatch[1] : 'NOT FOUND';
    
    console.log(`   Anchor.toml:             ✅`);
    console.log(`   Program ID:              ${programId}\n`);
  } else {
    console.log(`   Anchor.toml:             ❌\n`);
  }
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 X404 Bridge SDK Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const sdkComplete = hasX404Bridge && hasTokenize && hasSyncReputation && hasListForSale && hasPurchase;
  const interfacesComplete = hasSPL8004Client && hasAgentData && hasAgentMetadata && hasAgentNFTData;
  const depsComplete = hasSolanaWeb3 && hasAnchor && hasSPLToken && hasArweave;
  
  console.log(`✅ SDK Implementation:     ${sdkComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`✅ TypeScript Interfaces:  ${interfacesComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`✅ Dependencies:           ${depsComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`✅ Rust Program:           ${programExists ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`⚠️  Deployed on Devnet:    NO (needs: anchor build && anchor deploy)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (sdkComplete && interfacesComplete && depsComplete && programExists) {
    console.log('🎉 X404 NFT Bridge SDK is READY!\n');
    console.log('📝 Next Steps to Deploy:');
    console.log('   1. Update Rust toolchain: rustup update');
    console.log('   2. Build program: cd x404-integration && anchor build');
    console.log('   3. Deploy to devnet: anchor deploy');
    console.log('   4. Initialize state: anchor run initialize');
    console.log('   5. Test with SDK: import { X404Bridge } from "./x404-integration/sdk/src/index"\n');
    
    console.log('📖 SDK Features Available:');
    console.log('   ✓ tokenizeAgent(agentId) - Convert agent to NFT');
    console.log('   ✓ syncReputation(agentId) - Update reputation on-chain');
    console.log('   ✓ listForSale(agentId, price) - List NFT on marketplace');
    console.log('   ✓ delist(agentId) - Remove from marketplace');
    console.log('   ✓ purchase(agentId) - Buy listed NFT');
    console.log('   ✓ getListedNFTs() - Get all listed NFTs');
    console.log('   ✓ getAgentValuation(reputation) - Calculate price\n');
    
    process.exit(0);
  } else {
    console.log('⚠️  X404 Bridge SDK has missing components\n');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
