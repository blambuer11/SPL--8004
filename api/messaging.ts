/**
 * Agent Messaging API
 * 
 * REST API for SPL-ACP (Agent Communication Protocol)
 * Enables agents and users to send/receive messages via HTTP endpoints
 * 
 * Base URL: /api/messaging
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';

// SPL-ACP Program ID
const ACP_PROGRAM_ID = 'FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  signature?: string;
}

interface SendMessageRequest {
  fromAgent: string;
  toAgent: string;
  content: string;
  walletSignature?: string;
}

interface GetMessagesQuery {
  agentId: string;
  limit?: number;
  offset?: number;
}

// In-memory message store (replace with database in production)
const messageStore: Message[] = [];

/**
 * POST /api/messaging/send
 * 
 * Send a message from one agent to another
 * 
 * Request Body:
 * ```json
 * {
 *   "fromAgent": "agent-id-1",
 *   "toAgent": "agent-id-2",
 *   "content": "Hello from agent!",
 *   "walletSignature": "optional-signature"
 * }
 * ```
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "message": {
 *     "id": "msg-uuid",
 *     "from": "agent-id-1",
 *     "to": "agent-id-2",
 *     "content": "Hello from agent!",
 *     "timestamp": 1699632000000
 *   }
 * }
 * ```
 */
export async function sendMessage(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromAgent, toAgent, content, walletSignature }: SendMessageRequest = req.body;

    if (!fromAgent || !toAgent || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: fromAgent, toAgent, content' 
      });
    }

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: fromAgent,
      to: toAgent,
      content,
      timestamp: Date.now(),
      signature: walletSignature,
    };

    messageStore.push(message);

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * GET /api/messaging/inbox?agentId=agent-1&limit=20&offset=0
 * 
 * Get inbox messages for an agent
 * 
 * Query Parameters:
 * - agentId (required): Agent ID to fetch messages for
 * - limit (optional): Number of messages to return (default: 50)
 * - offset (optional): Pagination offset (default: 0)
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "messages": [
 *     {
 *       "id": "msg-uuid",
 *       "from": "agent-id-2",
 *       "to": "agent-id-1",
 *       "content": "Hello!",
 *       "timestamp": 1699632000000
 *     }
 *   ],
 *   "total": 42,
 *   "limit": 20,
 *   "offset": 0
 * }
 * ```
 */
export async function getInbox(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentId, limit = '50', offset = '0' } = req.query as any;

    if (!agentId) {
      return res.status(400).json({ error: 'Missing required parameter: agentId' });
    }

    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    // Filter messages where agent is recipient
    const inbox = messageStore
      .filter(msg => msg.to === agentId)
      .sort((a, b) => b.timestamp - a.timestamp);

    const paginatedMessages = inbox.slice(offsetNum, offsetNum + limitNum);

    return res.status(200).json({
      success: true,
      messages: paginatedMessages,
      total: inbox.length,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    return res.status(500).json({ error: 'Failed to fetch inbox' });
  }
}

/**
 * GET /api/messaging/sent?agentId=agent-1&limit=20&offset=0
 * 
 * Get sent messages for an agent
 * 
 * Query Parameters:
 * - agentId (required): Agent ID to fetch sent messages for
 * - limit (optional): Number of messages to return (default: 50)
 * - offset (optional): Pagination offset (default: 0)
 * 
 * Response: Same format as /inbox
 */
export async function getSent(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentId, limit = '50', offset = '0' } = req.query as any;

    if (!agentId) {
      return res.status(400).json({ error: 'Missing required parameter: agentId' });
    }

    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    // Filter messages where agent is sender
    const sent = messageStore
      .filter(msg => msg.from === agentId)
      .sort((a, b) => b.timestamp - a.timestamp);

    const paginatedMessages = sent.slice(offsetNum, offsetNum + limitNum);

    return res.status(200).json({
      success: true,
      messages: paginatedMessages,
      total: sent.length,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Get sent error:', error);
    return res.status(500).json({ error: 'Failed to fetch sent messages' });
  }
}

/**
 * GET /api/messaging/history?agent1=agent-1&agent2=agent-2&limit=50
 * 
 * Get conversation history between two agents
 * 
 * Query Parameters:
 * - agent1 (required): First agent ID
 * - agent2 (required): Second agent ID
 * - limit (optional): Number of messages to return (default: 100)
 * 
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "conversation": [
 *     {
 *       "id": "msg-uuid",
 *       "from": "agent-1",
 *       "to": "agent-2",
 *       "content": "Hello!",
 *       "timestamp": 1699632000000
 *     },
 *     {
 *       "id": "msg-uuid-2",
 *       "from": "agent-2",
 *       "to": "agent-1",
 *       "content": "Hi there!",
 *       "timestamp": 1699632001000
 *     }
 *   ],
 *   "participants": ["agent-1", "agent-2"]
 * }
 * ```
 */
export async function getHistory(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agent1, agent2, limit = '100' } = req.query as { 
      agent1?: string; 
      agent2?: string; 
      limit?: string; 
    };

    if (!agent1 || !agent2) {
      return res.status(400).json({ 
        error: 'Missing required parameters: agent1, agent2' 
      });
    }

    const limitNum = parseInt(limit, 10);

    // Filter messages between the two agents
    const conversation = messageStore
      .filter(msg => 
        (msg.from === agent1 && msg.to === agent2) ||
        (msg.from === agent2 && msg.to === agent1)
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limitNum); // Get last N messages

    return res.status(200).json({
      success: true,
      conversation,
      participants: [agent1, agent2],
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
}

/**
 * Main API handler
 * Routes requests to appropriate function based on path
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  switch (action) {
    case 'send':
      return sendMessage(req, res);
    case 'inbox':
      return getInbox(req, res);
    case 'sent':
      return getSent(req, res);
    case 'history':
      return getHistory(req, res);
    default:
      return res.status(404).json({ 
        error: 'Invalid action',
        availableActions: ['send', 'inbox', 'sent', 'history']
      });
  }
}
