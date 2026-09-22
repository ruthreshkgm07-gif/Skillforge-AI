import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Bot,
  User as UserIcon,
  Clock,
  Loader2,
  Brain,
  Zap,
  CheckCircle2,
  Code,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSessionSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant' | string;
  content: string;
  createdAt: string;
}

export const AIAssistantPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Sessions List
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery<any>({
    queryKey: ['ai-assistant-sessions'],
    queryFn: () => apiClient.get('/ai/assistant/sessions'),
  });

  const sessions: ChatSessionSummary[] = sessionsData?.data || [];

  // Set default active session
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // 2. Fetch Messages for Active Session
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<any>({
    queryKey: ['ai-assistant-messages', activeSessionId],
    queryFn: () => apiClient.get(`/ai/assistant/sessions/${activeSessionId}/messages`),
    enabled: Boolean(activeSessionId),
  });

  const messages: ChatMessageItem[] = messagesData?.data || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (payload: { message: string; sessionId?: string | null }) =>
      apiClient.post('/ai/assistant/chat', payload),
    onSuccess: (data: any) => {
      const responseData = data?.data || data;
      const targetSessionId = responseData?.sessionId || activeSessionId;
      if (targetSessionId && targetSessionId !== activeSessionId) {
        setActiveSessionId(targetSessionId);
      }
      if (targetSessionId) {
        queryClient.invalidateQueries({ queryKey: ['ai-assistant-messages', targetSessionId] });
      }
      queryClient.invalidateQueries({ queryKey: ['ai-assistant-sessions'] });
      setInputMessage('');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to communicate with AI Assistant.';
      console.error('Chat error:', msg);
    },
  });

  // 4. Create New Session Handler
  const handleNewChat = () => {
    setActiveSessionId(null);
    setInputMessage('');
  };

  // 5. Submit Message Form
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      message: inputMessage.trim(),
      sessionId: activeSessionId,
    });
  };

  // Basic markdown text renderer helper (bullet points, bold text, code blocks)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold my-2 text-foreground">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-extrabold my-2 text-foreground">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
            {formatBoldText(line.substring(2))}
          </li>
        );
      }
      if (line.startsWith('```')) {
        return (
          <div key={idx} className="my-2 p-3 rounded-lg bg-black/80 font-mono text-xs text-green-400 overflow-x-auto border border-border/50">
            {line.replace(/```[a-z]*/g, '')}
          </div>
        );
      }
      return (
        <p key={idx} className="text-xs leading-relaxed mb-1 text-foreground/90">
          {formatBoldText(line)}
        </p>
      );
    });
  };

  const formatBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
      {/* LEFT SIDEBAR: Sessions History Panel */}
      <aside className="w-72 shrink-0 flex flex-col rounded-2xl border bg-card p-4 shadow-xs">
        <Button
          onClick={handleNewChat}
          variant="gradient"
          className="w-full gap-2 text-xs shadow-sm mb-4"
        >
          <Plus className="h-4 w-4" /> New Chat Session
        </Button>

        <div className="flex items-center justify-between pb-2 mb-2 border-b">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Conversations</span>
          <Badge variant="outline" className="text-[10px] font-mono">{sessions.length}</Badge>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {isLoadingSessions ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">No previous conversations yet.</p>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span className="truncate">{session.title}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN CHAT WORKSPACE */}
      <main className="flex flex-1 flex-col rounded-2xl border bg-card shadow-xs overflow-hidden">
        {/* Workspace Top Bar */}
        <header className="flex h-14 items-center justify-between border-b px-6 bg-card/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">SkillForge AI Personal Assistant</h2>
              <p className="text-[10px] text-muted-foreground">Powered by Google Gemini 1.5 Pro • Context Aware</p>
            </div>
          </div>

          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-[11px] text-primary border-primary/30">
            <Zap className="h-3 w-3 animate-pulse text-primary" /> Live Context Active
          </Badge>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingMessages ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 rounded-2xl" />
              <Skeleton className="h-20 w-2/3 rounded-2xl ml-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-foreground">How can I help your career path today?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask me about resume improvements, skill gap recommendations, interview questions, or your learning roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg text-left pt-2">
                <button
                  type="button"
                  onClick={() => setInputMessage('What should I focus on improving this week based on my test scores?')}
                  className="rounded-xl border p-3 text-xs text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                >
                  🎯 "What should I focus on improving this week?"
                </button>
                <button
                  type="button"
                  onClick={() => setInputMessage('How can I optimize my resume for a Software Engineer role?')}
                  className="rounded-xl border p-3 text-xs text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                >
                  📄 "How can I optimize my resume for ATS?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-xs ${
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gradient-to-br from-accent to-purple-700 text-white'
                    }`}
                  >
                    {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-[75%] rounded-2xl p-4 text-xs shadow-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-xs'
                        : 'bg-card border border-border/80 text-foreground rounded-tl-xs'
                    }`}
                  >
                    {isUser ? <p>{msg.content}</p> : renderMarkdown(msg.content)}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Typing Indicator */}
          {sendMessageMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple-700 text-white font-bold text-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>SkillForge AI is generating response...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Footer */}
        <footer className="p-4 border-t bg-card/60 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask SkillForge AI Assistant anything about your skills, roadmap, or interviews..."
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              variant="gradient"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </footer>
      </main>
    </div>
  );
};

export default AIAssistantPage;
