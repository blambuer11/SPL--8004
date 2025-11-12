import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

interface MessageContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getMessagesForAgent: (agentId: string) => Message[];
  getConversation: (agent1: string, agent2: string) => Message[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getMessagesForAgent = (agentId: string) => {
    return messages
      .filter(msg => msg.to === agentId || msg.from === agentId)
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  const getConversation = (agent1: string, agent2: string) => {
    return messages
      .filter(msg => 
        (msg.from === agent1 && msg.to === agent2) ||
        (msg.from === agent2 && msg.to === agent1)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage, getMessagesForAgent, getConversation }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within MessageProvider');
  }
  return context;
}
