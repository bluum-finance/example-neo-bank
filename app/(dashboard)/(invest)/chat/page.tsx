'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatSuggestions } from '@/components/ai-wealth/chat-suggestions';
import { AssistantService } from '@/services/assistant.service';
import { getAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendProgrammatically = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    await sendMessage(messageText.trim());
  };

  // Handle initial message from query parameter
  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam && messages.length === 0 && !isLoading) {
      const decodedMessage = decodeURIComponent(messageParam);
      setInput(decodedMessage);
      // Auto-send the message after a short delay
      const timer = setTimeout(() => {
        handleSendProgrammatically(decodedMessage);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const formatMessage = (text: string) => {
    // Split by lines to handle line breaks
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Parse bold markdown (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2);
              return (
                <strong key={partIndex} className="font-semibold">
                  {boldText}
                </strong>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    await sendMessage(userMessage.content);
  };

  const sendMessage = async (messageText: string) => {
    setIsLoading(true);
    const account = getAuth();
    const accountId = account?.externalAccountId;
    const portfolioId = searchParams.get('portfolio_id') || undefined;

    try {
      if (!accountId) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sign in or create an account to use Bluum AI.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      const response = await AssistantService.chat(accountId, messageText, {
        portfolio_id: portfolioId,
      });

      const assistantText =
        (response && (response.message || response.answer || response.text)) ||
        (typeof response === 'string' ? response : '') ||
        'No response from assistant.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      toast.error(err?.message || 'Failed to contact assistant');
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I could not reach the assistant. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-3rem)] lg:max-h-[900px] relative overflow-x-hidden">
      {/* Header */}
      <div className="pb-4 flex items-center gap-2 sm:gap-4 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 hover:bg-[#083423]/10 dark:hover:bg-white/10 rounded-full transition-all shrink-0"
        >
          <ArrowLeft className="h-4 w-4 text-gray-900 dark:text-white" />
        </Button>
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="rounded-2xl p-2 sm:p-3 shadow-lg relative overflow-hidden bg-gradient-to-br from-[#edf9cd] to-[#d4e8a8] dark:from-[#1A3A2C] dark:to-[#2A4D3C]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 dark:from-white/5 to-transparent" />
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 text-[#083423] dark:text-[#66D07A]" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 dark:bg-[#66D07A] rounded-full border-2 border-white dark:border-[#0E231F] animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#083423] to-[#0a4d2e] dark:from-[#66D07A] dark:to-[#57B75C] bg-clip-text text-transparent truncate">
                Bluum AI
              </h1>
              <Badge className="text-xs px-2 sm:px-2.5 py-1 border-0 shadow-sm shrink-0 bg-gradient-to-r from-[#083423] to-[#0a4d2e] dark:from-[#1A3A2C] dark:to-[#2A4D3C] text-white">
                <Sparkles className="h-3 w-3 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">AI-Powered</span>
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium truncate">
              Your intelligent investment advisor
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area & Input Area - Combined */}
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl relative bg-gradient-to-b from-white/95 dark:from-[#0F2A20]/95 via-white/90 dark:via-[#0F2A20]/90 to-[#edf9cd]/30 dark:to-[#1A3A2C]/30 backdrop-blur-sm">

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
          {messages.length === 0 ? (
            <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="relative shrink-0">
                      <div className="rounded-2xl p-2.5 shadow-lg bg-gradient-to-br from-[#edf9cd] to-[#d4e8a8] dark:from-[#1A3A2C] dark:to-[#2A4D3C]">
                        <Bot className="h-5 w-5 text-[#083423] dark:text-[#66D07A]" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg transition-all duration-300 hover:shadow-xl ${message.role === 'user'
                      ? 'bg-gradient-to-br from-[#083423] to-[#0a4d2e] dark:from-[#1A3A2C] dark:to-[#2A4D3C] text-white'
                      : 'bg-white/90 dark:bg-[#0F2A20]/90 backdrop-blur-sm text-[#083423] dark:text-white border border-[#edf9cd] dark:border-border'
                      }`}
                  >
                    <div className="text-sm sm:text-[15px] leading-relaxed font-medium break-words">
                      {formatMessage(message.content)}
                    </div>
                    <p
                      className={`text-xs mt-3 font-medium ${message.role === 'user' ? 'text-white/60' : 'text-[#083423]/50 dark:text-muted-foreground'
                        }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="rounded-full p-2 shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1A3A2C] dark:to-[#2A4D3C] shadow-md">
                      <User className="h-5 w-5 text-gray-600 dark:text-[#66D07A]" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start items-start animate-in fade-in">
                  <div className="rounded-2xl p-2.5 shadow-lg shrink-0 bg-gradient-to-br from-[#edf9cd] to-[#d4e8a8] dark:from-[#1A3A2C] dark:to-[#2A4D3C]">
                    <Bot className="h-5 w-5 text-[#083423] dark:text-[#66D07A]" />
                  </div>
                  <div className="bg-white/90 dark:bg-[#0F2A20]/90 backdrop-blur-sm rounded-2xl px-5 py-4 border border-[#edf9cd] dark:border-border shadow-lg">
                    <div className="flex gap-2 items-center">
                      <div className="h-2.5 w-2.5 rounded-full animate-bounce bg-[#083423] dark:bg-[#66D07A]" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                      <div className="h-2.5 w-2.5 rounded-full animate-bounce bg-[#083423] dark:bg-[#66D07A]" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
                      <div className="h-2.5 w-2.5 rounded-full animate-bounce bg-[#083423] dark:bg-[#66D07A]" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-[#edf9cd]/50 dark:border-border/50 relative z-10">
          <CardContent className="p-3 sm:p-5">
            <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative min-w-0">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full h-12 pl-4 pr-10 sm:pr-12 rounded-xl border-2 bg-white/80 dark:bg-[#0F2A20]/80 backdrop-blur-sm border-[#edf9cd] dark:border-border focus-visible:border-[#083423] dark:focus-visible:border-[#66D07A] focus-visible:ring-2 focus-visible:ring-[#083423]/20 dark:focus-visible:ring-[#66D07A]/20 transition-all shadow-sm text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                  <Zap className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 sm:w-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 shrink-0 bg-gradient-to-r from-[#083423] to-[#0a4d2e] dark:from-[#1A3A2C] dark:to-[#2A4D3C] text-white hover:opacity-90"
              >
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 shrink-0" />
                <p className="font-medium text-center text-[10px] sm:text-xs">
                  <span className="hidden sm:inline">
                    Powered by advanced AI • Real-time insights • Personalized advice
                  </span>
                  <span className="sm:hidden">AI-powered investment advice</span>
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
