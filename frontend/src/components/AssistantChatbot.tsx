import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAssistant } from '@/context/AssistantProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, X, Send, User, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AssistantChatbot: React.FC = () => {
  const location = useLocation();
  const { isOpen, toggleOpen, setIsOpen, messages, sendMessage, isLoading } = useAssistant();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Route-aware Starter Prompts
  const getStarterPrompts = () => {
    const path = location.pathname;
    if (path.includes('/resume')) {
      return [
        'How can I boost my resume ATS score?',
        'What missing projects should I build?',
        'Rewrite bullet points with repo evidence',
      ];
    } else if (path.includes('/coding-tracker')) {
      return [
        'Explain time & space complexity of my code',
        'How to optimize this algorithm with two pointers?',
        'Suggest edge cases for my test solution',
      ];
    } else if (path.includes('/assessment')) {
      return [
        'How to prepare for Voice AI interview?',
        'Which technical MCQ topics should I practice?',
      ];
    } else if (path.includes('/recruiter')) {
      return [
        'How does pgvector cosine matching work?',
        'How to filter top candidate resumes by fit score?',
      ];
    }
    return [
      'What should I focus on next to boost placement odds?',
      'Analyze my top skill gaps',
      'How to prepare for my AI Mock Interview?',
    ];
  };

  const starterPrompts = getStarterPrompts();

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const formatMarkdown = (text: string) => {
    // Simple markdown parsing for bold and bullet lists
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc space-y-1" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, '') }} />
        );
      }
      return <p key={idx} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-xl hover:shadow-primary/30 transition-all focus:outline-none"
        aria-label="Open SkillForge AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success ring-2 ring-background animate-pulse" />
      </motion.button>

      {/* Slide-In Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[520px]"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b p-4 bg-muted/40">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none flex items-center gap-1.5">
                    SkillForge AI Assistant
                    <Badge variant="success" className="text-[9px] px-1 py-0 font-mono">Gemini 1.5</Badge>
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Context-aware career mentor</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs'
                        : 'bg-muted/60 text-foreground border border-border/50 rounded-tl-xs'
                    }`}
                  >
                    {msg.sender === 'assistant' ? formatMarkdown(msg.content) : <p>{msg.content}</p>}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground font-bold mt-0.5 text-[10px]">
                      You
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground text-xs py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary animate-pulse">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span className="animate-pulse font-medium">Gemini AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Starter Prompt Chips */}
            <div className="px-3 py-2 border-t bg-muted/20 flex gap-1.5 overflow-x-auto no-scrollbar">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-all truncate max-w-[200px]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t bg-card flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask SkillForge AI anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-9 rounded-xl border bg-muted/30 px-3 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                variant="gradient"
                size="icon"
                className="h-9 w-9 rounded-xl shrink-0"
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssistantChatbot;
