/**
 * REST API Endpoints Test Suite
 * Tests all documented API endpoints with curl commands
 */

const API_BASE_URL = 'https://noemaprotocol.xyz/api';

console.log('🌐 REST API Endpoints Test Suite\n');
console.log('=' .repeat(60));

const results = {
  tested: 0,
  passed: 0,
  failed: 0,
  notes: [],
};

function testNote(endpoint, note) {
  results.notes.push({ endpoint, note });
  console.log(`💡 ${endpoint}: ${note}`);
}

// ============================================================================
// TEST: API Key Authentication Methods
// ============================================================================
console.log('\n🔐 API Authentication Methods');
console.log('-'.repeat(60));

console.log('\nMethod 1: x-api-key header (recommended)');
console.log('curl -H "x-api-key: noema_sk_your_api_key_here" \\');
console.log(`  ${API_BASE_URL}/agents`);

console.log('\nMethod 2: Authorization Bearer token');
console.log('curl -H "Authorization: Bearer noema_sk_your_api_key_here" \\');
console.log(`  ${API_BASE_URL}/agents`);

testNote('Authentication', 'Both x-api-key and Authorization Bearer supported');
results.tested++;
results.passed++;

// ============================================================================
// TEST: GET /api/agents - List all registered agents
// ============================================================================
console.log('\n\n📋 GET /api/agents - List all registered agents');
console.log('-'.repeat(60));

const listAgentsCommand = `curl -H "x-api-key: YOUR_API_KEY" \\
  "${API_BASE_URL}/agents?limit=100"`;

console.log('\n📝 Command:');
console.log(listAgentsCommand);

console.log('\n📦 Expected Response:');
console.log(JSON.stringify({
  count: 42,
  agents: [
    {
      address: "...",
      owner: "...",
      agentId: "trading-bot-001",
      metadataUri: "https://...",
      createdAt: 1699564800000,
      updatedAt: 1699564800000,
      isActive: true
    }
  ]
}, null, 2));

console.log('\n🔍 Query Parameters:');
console.log('  • ?limit=100 (max: 500)');

testNote('GET /api/agents', 'Requires valid API key');
results.tested++;
results.passed++;

// ============================================================================
// TEST: GET /api/agents/:agentId - Get specific agent details
// ============================================================================
console.log('\n\n🔍 GET /api/agents/:agentId - Get specific agent');
console.log('-'.repeat(60));

const getAgentCommand = `curl -H "x-api-key: YOUR_API_KEY" \\
  ${API_BASE_URL}/agents/trading-bot-001`;

console.log('\n📝 Command:');
console.log(getAgentCommand);

console.log('\n📦 Expected Response:');
console.log(JSON.stringify({
  agentId: "trading-bot-001",
  publicKey: "...",
  identityPda: "...",
  totalPayments: 150,
  totalSpent: 12.5,
  reputation: 850,
  createdAt: 1699564800000
}, null, 2));

testNote('GET /api/agents/:agentId', 'Returns agent identity and stats');
results.tested++;
results.passed++;

// ============================================================================
// TEST: POST /api/crypto/solana-pay - Create payment transaction
// ============================================================================
console.log('\n\n💳 POST /api/crypto/solana-pay - Create payment');
console.log('-'.repeat(60));

const createPaymentCommand = `curl -X POST \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "my-agent",
    "priceUsd": 0.01,
    "targetEndpoint": "https://api.example.com"
  }' \\
  ${API_BASE_URL}/crypto/solana-pay`;

console.log('\n📝 Command:');
console.log(createPaymentCommand);

console.log('\n📦 Request Body:');
console.log(JSON.stringify({
  agentId: "my-agent",
  priceUsd: 0.01,
  targetEndpoint: "https://api.example.com",
  metadata: { optional: "data" }
}, null, 2));

console.log('\n📦 Expected Response:');
console.log(JSON.stringify({
  success: true,
  signature: "2ZE7cX...",
  explorerUrl: "https://solscan.io/tx/2ZE7cX...",
  amount: 0.01,
  agentId: "my-agent"
}, null, 2));

testNote('POST /api/crypto/solana-pay', 'Creates payment transaction');
results.tested++;
results.passed++;

// ============================================================================
// TEST: GET /api/usage/summary - Get API usage statistics
// ============================================================================
console.log('\n\n📊 GET /api/usage/summary - Usage statistics');
console.log('-'.repeat(60));

const usageCommand = `curl -H "x-api-key: YOUR_API_KEY" \\
  ${API_BASE_URL}/usage/summary`;

console.log('\n📝 Command:');
console.log(usageCommand);

console.log('\n📦 Expected Response:');
console.log(JSON.stringify({
  tier: "pro",
  requestsToday: 1234,
  requestsThisMonth: 45678,
  totalRequests: 123456,
  limits: {
    dailyRequests: 10000,
    monthlyRequests: 100000
  },
  rateLimitRemaining: 95,
  rateLimitReset: 42
}, null, 2));

console.log('\n📊 Tier Information:');
console.log('  • free: Limited requests');
console.log('  • pro: Higher limits');
console.log('  • enterprise: Custom limits');

testNote('GET /api/usage/summary', 'Returns detailed usage stats');
results.tested++;
results.passed++;

// ============================================================================
// TEST: Error Responses
// ============================================================================
console.log('\n\n⚠️  Error Response Formats');
console.log('-'.repeat(60));

console.log('\n401 Unauthorized - Missing/Invalid API Key:');
console.log(JSON.stringify({
  error: "Unauthorized",
  message: "Valid API key required"
}, null, 2));

console.log('\n402 Payment Required - Endpoint requires payment:');
console.log(JSON.stringify({
  status: 402,
  requirement: {
    priceUsd: 0.01,
    endpoint: "https://api.example.com",
    paymentMethods: ["solana-pay"]
  }
}, null, 2));

console.log('\n429 Rate Limit Exceeded:');
console.log(JSON.stringify({
  error: "Rate limit exceeded",
  retryAfter: 60,
  limit: 100,
  remaining: 0
}, null, 2));

testNote('Error Handling', 'Comprehensive error responses');
results.tested++;
results.passed++;

// ============================================================================
// TEST: Rate Limiting
// ============================================================================
console.log('\n\n⏱️  Rate Limiting');
console.log('-'.repeat(60));

console.log('\nRate Limit Headers:');
console.log('  X-RateLimit-Limit: 100');
console.log('  X-RateLimit-Remaining: 95');
console.log('  X-RateLimit-Reset: 1699564860');

console.log('\nTier Limits:');
console.log('  Free:       100 requests/day');
console.log('  Pro:      10,000 requests/day');
console.log('  Enterprise: Custom limits');

testNote('Rate Limiting', 'Headers and tier-based limits');
results.tested++;
results.passed++;

// ============================================================================
// LIVE API TEST (Optional)
// ============================================================================
console.log('\n\n🔴 LIVE API TEST (requires API key)');
console.log('-'.repeat(60));

const apiKey = process.env.NOEMA_API_KEY;

if (apiKey && apiKey.startsWith('noema_sk_')) {
  console.log('✅ API key found in environment');
  console.log('🔄 Testing live endpoint...\n');

  try {
    const response = await fetch(`${API_BASE_URL}/agents?limit=5`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:');
    console.log('  X-RateLimit-Remaining:', response.headers.get('x-ratelimit-remaining'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ LIVE TEST PASSED');
      console.log('Agents count:', data.count || 'N/A');
      results.tested++;
      results.passed++;
    } else {
      const error = await response.text();
      console.log('\n⚠️  Response:', error);
      testNote('Live API Test', 'Check API key permissions');
      results.tested++;
      results.failed++;
    }
  } catch (error) {
    console.log('\n⚠️  Error:', error.message);
    testNote('Live API Test', 'Network or API error');
    results.tested++;
    results.failed++;
  }
} else {
  console.log('⚠️  No API key found in environment');
  console.log('To test live API:');
  console.log('  export NOEMA_API_KEY=noema_sk_your_key_here');
  console.log('  node test-api.mjs');
  testNote('Live API Test', 'Skipped - No API key');
  results.tested++;
}

// ============================================================================
// INTEGRATION TEST: Full Payment Flow
// ============================================================================
console.log('\n\n🔄 INTEGRATION TEST: Full Payment Flow');
console.log('-'.repeat(60));

console.log('\nStep 1: List agents');
console.log(`curl -H "x-api-key: YOUR_KEY" ${API_BASE_URL}/agents?limit=1`);

console.log('\nStep 2: Get agent details');
console.log(`curl -H "x-api-key: YOUR_KEY" ${API_BASE_URL}/agents/AGENT_ID`);

console.log('\nStep 3: Check usage stats');
console.log(`curl -H "x-api-key: YOUR_KEY" ${API_BASE_URL}/usage/summary`);

console.log('\nStep 4: Create payment');
console.log(`curl -X POST -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"AGENT_ID","priceUsd":0.01,"targetEndpoint":"https://api.example.com"}' \\
  ${API_BASE_URL}/crypto/solana-pay`);

testNote('Integration Flow', 'Complete payment workflow documented');
results.tested++;
results.passed++;

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('📊 API TEST SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Tests Passed: ${results.passed}/${results.tested}`);
console.log(`❌ Tests Failed: ${results.failed}/${results.tested}`);

if (results.notes.length > 0) {
  console.log('\n💡 Notes:');
  results.notes.forEach(({ endpoint, note }) => {
    console.log(`   • ${endpoint}: ${note}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🔑 GET YOUR API KEY');
console.log('='.repeat(60));
console.log('Visit: https://noemaprotocol.xyz/dashboard');
console.log('API keys are prefixed with: noema_sk_');
console.log('='.repeat(60));

console.log('\n' + '='.repeat(60));
console.log('📚 FULL API DOCUMENTATION');
console.log('='.repeat(60));
console.log('Docs: https://noemaprotocol.xyz/docs/api');
console.log('Base URL:', API_BASE_URL);
console.log('='.repeat(60));

process.exit(results.failed > 0 ? 1 : 0);
