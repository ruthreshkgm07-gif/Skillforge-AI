import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: ChatMessage[];
  sendMessage: (messageText: string) => void;
  isLoading: boolean;
  sessionId: string | null;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: 'Hello! 👋 I am your **SkillForge AI Assistant**. How can I help accelerate your learning, resume score, or job search today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const res: any = await apiClient.post('/ai/assistant/chat', {
        sessionId: sessionId,
        message: messageText,
      });
      return res.data || res;
    },
    onSuccess: (responseData: any) => {
      const payload = responseData?.data || responseData;
      if (payload && payload.reply) {
        if (!sessionId && payload.sessionId) {
          setSessionId(payload.sessionId);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'assistant',
            content: payload.reply,
            timestamp: payload.timestamp || new Date().toISOString(),
          },
        ]);
      }
    },
    onError: (err: any) => {
      const errorDetail = err?.response?.data?.message || err?.message || 'Unable to connect to AI Assistant. Please check your API key in .env';
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'assistant',
          content: `⚠️ **AI Service Error**: ${errorDetail}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
  });

  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    chatMutation.mutate(messageText);
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        messages,
        sendMessage,
        isLoading: chatMutation.isPending,
        sessionId,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
