#!/usr/bin/env node

/**
 * X402 Payment API Test Script
 * Tests the /api/x402/payment endpoint
 */

const API_BASE = 'https://api.noemaprotocol.xyz';
const LOCAL_BASE = 'http://localhost:3000';

// Use local for testing
const BASE_URL = LOCAL_BASE;

console.log('🧪 X402 Payment API Test\n');
console.log('Base URL:', BASE_URL);
console.log('='.repeat(60));

// Test 1: GET - API Documentation
async function testGetDocumentation() {
  console.log('\n📖 Test 1: GET /api/x402/payment (Documentation)');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/x402/payment`, {
      method: 'GET',
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.name === 'X402 Payment API') {
      console.log('✅ PASS: Documentation endpoint working');
      return true;
    } else {
      console.log('❌ FAIL: Unexpected response');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 2: POST - Invalid API Key
async function testInvalidApiKey() {
  console.log('\n🔐 Test 2: POST with Invalid API Key');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/x402/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'invalid_key_12345',
      },
      body: JSON.stringify({
        amount: 0.01,
        recipient: '2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ',
        memo: 'Test payment',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401 && data.error === 'Invalid API key') {
      console.log('✅ PASS: Invalid API key rejected');
      return true;
    } else {
      console.log('❌ FAIL: Expected 401 Unauthorized');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 3: POST - Valid Payment Request
async function testValidPayment() {
  console.log('\n💰 Test 3: POST Valid Payment Request');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/x402/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'noema_sk_demo_12345', // Demo key
      },
      body: JSON.stringify({
        amount: 0.01,
        recipient: '2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ',
        memo: 'Test payment from API test script',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success && data.transactionId && data.paymentInfo) {
      console.log('✅ PASS: Payment transaction created');
      console.log('   Transaction ID:', data.transactionId);
      console.log('   Amount:', data.paymentInfo.amount, 'USDC');
      console.log('   Fee:', data.paymentInfo.fee, 'USDC');
      console.log('   Net Amount:', data.paymentInfo.netAmount, 'USDC');
      return true;
    } else {
      console.log('❌ FAIL: Payment creation failed');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 4: POST - Invalid Amount
async function testInvalidAmount() {
  console.log('\n⚠️  Test 4: POST with Invalid Amount');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/x402/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'noema_sk_demo_12345',
      },
      body: JSON.stringify({
        amount: -0.01, // Negative amount
        recipient: '2eMCYLPtxuN7gYNTxWfecbuHEKFsoXLfKLPcMERYaNfJ',
        memo: 'Invalid payment',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400 && data.error === 'Invalid amount') {
      console.log('✅ PASS: Invalid amount rejected');
      return true;
    } else {
      console.log('❌ FAIL: Expected 400 Bad Request');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 5: POST - Invalid Recipient
async function testInvalidRecipient() {
  console.log('\n⚠️  Test 5: POST with Invalid Recipient');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/x402/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'noema_sk_demo_12345',
      },
      body: JSON.stringify({
        amount: 0.01,
        recipient: 'invalid_address',
        memo: 'Invalid payment',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400 && data.error === 'Invalid recipient address') {
      console.log('✅ PASS: Invalid recipient rejected');
      return true;
    } else {
      console.log('❌ FAIL: Expected 400 Bad Request');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting API Tests...\n');
  
  const results = [];
  
  results.push(await testGetDocumentation());
  results.push(await testInvalidApiKey());
  results.push(await testValidPayment());
  results.push(await testInvalidAmount());
  results.push(await testInvalidRecipient());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
}

// Run tests
runAllTests().catch(console.error);
