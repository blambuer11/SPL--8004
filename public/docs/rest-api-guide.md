# Noema Protocol REST API Documentation

## Quick Start

### 1. Get Your API Key

Visit [noemaprotocol.xyz/pricing](https://noemaprotocol.xyz/pricing) and subscribe to a plan:

- **Free Tier**: 1,000 calls/month, 60 req/min
- **Pro**: 100K calls/month, 300 req/min (0.1 SOL/month)
- **Enterprise**: 1M+ calls/month, unlimited rate (1 SOL/month)

Pay with SOL via Solana Pay. Get instant API key.

### 2. Authentication

All requests require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.noemaprotocol.xyz/api/agents
```

### 3. Base URL

```
Production: https://api.noemaprotocol.xyz
Development: http://localhost:3002
```

## Endpoints

### Health Check

**GET `/api/health`**

No authentication required.

```bash
curl https://api.noemaprotocol.xyz/api/health
```

Response:
```json
{
  "status": "ok",
  "service": "noema-protocol-api",
  "timestamp": "2025-11-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

### List All Agents

**GET `/api/agents`**

Retrieve all registered agents on the network.

```bash
curl -H "Authorization: Bearer noema_1730976000_abc123..." \
  https://api.noemaprotocol.xyz/api/agents | jq
```

Response:
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "agentId": "trading-bot-001",
      "owner": "5Kq7vH8J2N3M4P6R8S9T1U2V3W4X5Y6Z7A8B9C0D",
      "reputationScore": 8750,
      "totalValidations": 1250,
      "approvedValidations": 1180,
      "active": true,
      "metadataUri": "https://ipfs.io/ipfs/Qm..."
    }
  ]
}
```

---

### Get Agent Details

**GET `/api/agents/:agentId`**

Get detailed information about a specific agent.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.noemaprotocol.xyz/api/agents/trading-bot-001 | jq
```

Response:
```json
{
  "success": true,
  "data": {
    "agentId": "trading-bot-001",
    "reputationScore": 8750,
    "totalValidations": 1250,
    "approvedValidations": 1180,
    "rejectedValidations": 70,
    "pendingRewards": 250000000,
    "claimedRewards": 1500000000
  }
}
```

---

### Create Payment (X402)

**POST `/api/payment`**

Create an instant USDC payment via X402 protocol.

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "RecipientPublicKey123...",
    "amount": 1000000,
    "memo": "Payment for API call"
  }' \
  https://api.noemaprotocol.xyz/api/payment | jq
```

Request Body:
```json
{
  "recipient": "string (required) - Recipient Solana public key",
  "amount": "number (required) - Amount in USDC base units (1 USDC = 1,000,000)",
  "memo": "string (optional) - Payment memo"
}
```

Response:
```json
{
  "success": true,
  "signature": "5J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B...",
  "timestamp": "2025-11-07T10:35:00.000Z"
}
```

---

### Get Usage Summary

**GET `/api/usage/summary`**

Track your API usage and billing.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.noemaprotocol.xyz/api/usage/summary | jq
```

Response:
```json
{
  "mode": "prod",
  "today": 153,
  "total": 4821,
  "unitPrice": 0.001,
  "todayCost": 0.153,
  "totalCost": 4.821
}
```

---

## Rate Limits

Default rate limits per API key:

| Plan | Requests/Minute | Requests/Month |
|------|----------------|----------------|
| Free | 60 | 1,000 |
| Pro | 300 | 100,000 |
| Enterprise | Unlimited | 1,000,000+ |

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 42
```

When limit exceeded, API returns:

```json
{
  "error": "Too many requests, please try again later."
}
```

Status Code: `429 Too Many Requests`

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message (dev only)"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing API key)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Code Examples

### Node.js / TypeScript

```typescript
const API_KEY = 'noema_1730976000_abc123...';
const BASE_URL = 'https://api.noemaprotocol.xyz';

async function getAllAgents() {
  const response = await fetch(`${BASE_URL}/api/agents`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  const data = await response.json();
  console.log('Agents:', data);
}

getAllAgents();
```

### Python

```python
import requests

API_KEY = 'noema_1730976000_abc123...'
BASE_URL = 'https://api.noemaprotocol.xyz'

headers = {
    'Authorization': f'Bearer {API_KEY}'
}

response = requests.get(f'{BASE_URL}/api/agents', headers=headers)
agents = response.json()

print(f"Found {agents['count']} agents")
```

### cURL

```bash
# Set API key as environment variable
export NOEMA_API_KEY="noema_1730976000_abc123..."

# Get all agents
curl -H "Authorization: Bearer $NOEMA_API_KEY" \
  https://api.noemaprotocol.xyz/api/agents

# Get specific agent
curl -H "Authorization: Bearer $NOEMA_API_KEY" \
  https://api.noemaprotocol.xyz/api/agents/my-agent-id

# Create payment
curl -X POST \
  -H "Authorization: Bearer $NOEMA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"RecipientPubkey","amount":1000000,"memo":"Test payment"}' \
  https://api.noemaprotocol.xyz/api/payment
```

---

## Best Practices

### 1. Secure API Keys
- **Never** commit API keys to version control
- Store keys in environment variables
- Rotate keys periodically
- Use different keys for dev/prod

### 2. Handle Rate Limits
```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      await sleep(parseInt(resetTime!) * 1000);
      continue;
    }
    
    return response.json();
  }
  throw new Error('Max retries exceeded');
}
```

### 3. Cache Responses
Cache agent data for 60 seconds to reduce API calls:
```typescript
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

async function getCachedAgent(agentId: string) {
  const cached = cache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchAgent(agentId);
  cache.set(agentId, { data, timestamp: Date.now() });
  return data;
}
```

### 4. Monitor Usage
```typescript
async function checkUsage() {
  const usage = await fetch(`${BASE_URL}/api/usage/summary`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  }).then(r => r.json());
  
  if (usage.total > 90000) {
    console.warn('Approaching monthly limit!');
  }
}
```

---

## Webhook Integration (Pro/Enterprise)

Configure webhooks to receive real-time notifications:

```json
{
  "events": ["agent.registered", "validation.submitted", "reputation.updated"],
  "url": "https://your-app.com/webhooks/noema",
  "secret": "webhook_secret_key"
}
```

Webhook payload example:
```json
{
  "event": "reputation.updated",
  "timestamp": "2025-11-07T10:40:00.000Z",
  "data": {
    "agentId": "trading-bot-001",
    "oldScore": 8500,
    "newScore": 8750,
    "change": 250
  }
}
```

---

## Support

- 📧 Email: info@noemaprotocol.xyz
- 🐦 Twitter: [@NoemaProtocol](https://twitter.com/NoemaProtocol)
- 💬 Discord: [Join Community](https://discord.gg/noema)
- 📖 GitHub: [blambuer11/SPL--8004](https://github.com/blambuer11/SPL--8004)

---

## Changelog

### v1.0.0 (2025-11-07)
- Initial REST API release
- Agent listing and details endpoints
- X402 payment integration
- Usage tracking
- Rate limiting (60-300 req/min)
