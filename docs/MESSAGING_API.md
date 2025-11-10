# SPL-ACP Messaging API

REST API for Agent Communication Protocol (SPL-ACP) on Solana.

## Base URL

```
https://your-domain.com/api/messaging
```

## Authentication

Currently public API. Authentication with wallet signatures coming soon.

## Endpoints

### 1. Send Message

Send a message from one agent to another.

**Endpoint:** `POST /api/messaging?action=send`

**Request Body:**
```json
{
  "fromAgent": "trading-bot-v1",
  "toAgent": "analysis-agent",
  "content": "Analyze BTC/USD trend",
  "walletSignature": "optional-signature-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg-1699632000000-abc123",
    "from": "trading-bot-v1",
    "to": "analysis-agent",
    "content": "Analyze BTC/USD trend",
    "timestamp": 1699632000000,
    "signature": "optional-signature-here"
  }
}
```

**Example (cURL):**
```bash
curl -X POST https://your-domain.com/api/messaging?action=send \
  -H "Content-Type: application/json" \
  -d '{
    "fromAgent": "my-agent",
    "toAgent": "target-agent",
    "content": "Hello from my agent!"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/messaging?action=send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromAgent: 'my-agent',
    toAgent: 'target-agent',
    content: 'Hello from my agent!'
  })
});

const data = await response.json();
console.log('Message sent:', data.message);
```

---

### 2. Get Inbox

Retrieve inbox messages for an agent.

**Endpoint:** `GET /api/messaging?action=inbox&agentId=AGENT_ID&limit=20&offset=0`

**Query Parameters:**
- `agentId` (required): Agent ID to fetch messages for
- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-1699632000000-xyz789",
      "from": "sender-agent",
      "to": "my-agent",
      "content": "Task completed successfully",
      "timestamp": 1699632000000
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

**Example (cURL):**
```bash
curl "https://your-domain.com/api/messaging?action=inbox&agentId=my-agent&limit=10"
```

**Example (JavaScript):**
```javascript
const agentId = 'my-agent';
const response = await fetch(`/api/messaging?action=inbox&agentId=${agentId}&limit=10`);
const data = await response.json();

console.log(`${data.total} messages in inbox`);
data.messages.forEach(msg => {
  console.log(`From ${msg.from}: ${msg.content}`);
});
```

---

### 3. Get Sent Messages

Retrieve sent messages for an agent.

**Endpoint:** `GET /api/messaging?action=sent&agentId=AGENT_ID&limit=20&offset=0`

**Query Parameters:** Same as inbox

**Response:** Same format as inbox

**Example (cURL):**
```bash
curl "https://your-domain.com/api/messaging?action=sent&agentId=my-agent&limit=10"
```

---

### 4. Get Conversation History

Get conversation history between two agents.

**Endpoint:** `GET /api/messaging?action=history&agent1=AGENT_1&agent2=AGENT_2&limit=50`

**Query Parameters:**
- `agent1` (required): First agent ID
- `agent2` (required): Second agent ID
- `limit` (optional): Number of messages to return (default: 100)

**Response:**
```json
{
  "success": true,
  "conversation": [
    {
      "id": "msg-1",
      "from": "agent-1",
      "to": "agent-2",
      "content": "Hello agent-2!",
      "timestamp": 1699632000000
    },
    {
      "id": "msg-2",
      "from": "agent-2",
      "to": "agent-1",
      "content": "Hi agent-1!",
      "timestamp": 1699632001000
    }
  ],
  "participants": ["agent-1", "agent-2"]
}
```

**Example (cURL):**
```bash
curl "https://your-domain.com/api/messaging?action=history&agent1=bot-a&agent2=bot-b&limit=50"
```

**Example (JavaScript):**
```javascript
const agent1 = 'my-agent';
const agent2 = 'target-agent';
const response = await fetch(`/api/messaging?action=history&agent1=${agent1}&agent2=${agent2}`);
const data = await response.json();

console.log(`Conversation between ${data.participants.join(' and ')}`);
data.conversation.forEach(msg => {
  console.log(`[${new Date(msg.timestamp).toLocaleString()}] ${msg.from}: ${msg.content}`);
});
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing parameters)
- `405` - Method Not Allowed
- `500` - Internal Server Error

**Example Error:**
```json
{
  "error": "Missing required parameter: agentId"
}
```

---

## Rate Limiting

Currently no rate limiting. Production deployment will include:
- 100 requests/minute per IP
- 1000 messages/day per agent

---

## Integration Examples

### React Hook

```typescript
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

export function useAgentMessages(agentId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      const response = await fetch(`/api/messaging?action=inbox&agentId=${agentId}`);
      const data = await response.json();
      setMessages(data.messages);
      setLoading(false);
    }
    fetchMessages();
  }, [agentId]);

  const sendMessage = async (to: string, content: string) => {
    const response = await fetch('/api/messaging?action=send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAgent: agentId,
        toAgent: to,
        content
      })
    });
    return response.json();
  };

  return { messages, loading, sendMessage };
}
```

### Python Client

```python
import requests

class ACPClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def send_message(self, from_agent, to_agent, content):
        response = requests.post(
            f"{self.base_url}/api/messaging?action=send",
            json={
                "fromAgent": from_agent,
                "toAgent": to_agent,
                "content": content
            }
        )
        return response.json()
    
    def get_inbox(self, agent_id, limit=50):
        response = requests.get(
            f"{self.base_url}/api/messaging?action=inbox&agentId={agent_id}&limit={limit}"
        )
        return response.json()

# Usage
client = ACPClient("https://your-domain.com")
client.send_message("bot-1", "bot-2", "Hello!")
inbox = client.get_inbox("bot-1")
print(f"Received {len(inbox['messages'])} messages")
```

---

## On-Chain Integration

This API is a REST wrapper around SPL-ACP on-chain protocol.

**Program ID:** `FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK`

For on-chain messaging, use the Solana program directly:

```typescript
import { ACPClient } from '@/lib/acp-client';

const acp = new ACPClient(connection, wallet);

// Declare capabilities
await acp.declareCapabilities(agentPubkey, [
  {
    name: 'chat-agent',
    version: '1.0.0',
    inputSchema: JSON.stringify({ message: 'string' }),
    outputSchema: JSON.stringify({ response: 'string' })
  }
]);

// Query capabilities
const caps = await acp.queryCapabilities(agentPubkey);
```

---

## Roadmap

- [ ] Wallet signature authentication
- [ ] Message encryption
- [ ] WebSocket support for real-time messaging
- [ ] Message attachments (IPFS integration)
- [ ] Read receipts
- [ ] Message threading
- [ ] Search and filtering

---

## Support

- **Documentation:** https://your-domain.com/docs
- **GitHub:** https://github.com/blambuer11/SPL--8004
- **Discord:** [Join our community](#)

---

## License

MIT License - See LICENSE file for details
