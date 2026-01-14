'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
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

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Question 1: What stocks should I buy?
    if (
      lowerMessage.includes('what stocks should i buy') ||
      lowerMessage.includes('what should i invest in') ||
      lowerMessage.includes('investment recommendations') ||
      lowerMessage.includes('recommend stocks')
    ) {
      return `Based on current market conditions, here are my recommendations:\n\n• **Technology**: Focus on companies with strong fundamentals and AI exposure\n• **Healthcare**: Consider dividend-paying pharma stocks for stability\n• **Consumer**: Look for brands with strong moats and consistent growth\n• **Diversification**: Consider ETFs like SPY or QQQ for broad market exposure\n\nRemember to align investments with your risk tolerance and time horizon.`;
    }

    // Question 2: How is the market doing?
    if (
      lowerMessage.includes('how is the market') ||
      lowerMessage.includes('market outlook') ||
      lowerMessage.includes('market trends') ||
      lowerMessage.includes('market performance')
    ) {
      return `Current market analysis:\n\n• **Market Sentiment**: Cautiously optimistic with some volatility expected\n• **Key Trends**: Technology and healthcare sectors showing resilience\n• **Interest Rates**: Keep an eye on Fed policy changes affecting bond yields\n• **Recommendation**: Stay diversified, avoid timing the market\n\nFor your portfolio, consider maintaining defensive positions while keeping growth exposure.`;
    }

    // Question 3: What's my risk level?
    if (
      lowerMessage.includes('what is my risk') ||
      lowerMessage.includes('risk assessment') ||
      lowerMessage.includes('how risky is my portfolio') ||
      lowerMessage.includes('risk level')
    ) {
      return `Your portfolio risk assessment:\n\n• **Current Risk Profile**: Moderate risk with good diversification\n• **Volatility**: Your holdings show moderate volatility, suitable for medium-term goals\n• **Recommendations**:\n  - Maintain 60-70% in diversified stocks\n  - Keep 20-30% in bonds or fixed income\n  - Hold 10-15% cash for opportunities\n\nYour current allocation aligns well with a moderate risk tolerance.`;
    }

    // Question 4: How are my investments performing?
    if (
      lowerMessage.includes('how are my investments') ||
      lowerMessage.includes('portfolio performance') ||
      lowerMessage.includes('how am i doing') ||
      lowerMessage.includes('investment returns')
    ) {
      return `Your portfolio performance overview:\n\n• **Total Return**: Your portfolio is performing well relative to benchmarks\n• **Key Metrics**: Risk-adjusted returns are solid, showing good risk management\n• **Top Performers**: Technology and healthcare positions leading gains\n• **Areas to Watch**: Consider rebalancing overweight positions\n\nFocus on long-term trends rather than daily fluctuations.`;
    }

    // Question 5: Should I sell my stocks?
    if (
      lowerMessage.includes('should i sell') ||
      lowerMessage.includes('when to sell') ||
      lowerMessage.includes('sell my stocks') ||
      lowerMessage.includes('exit position')
    ) {
      return `Selling decisions should be based on your investment strategy:\n\n• **Consider Selling If**:\n  - Stock no longer fits your investment thesis\n  - You need to rebalance your portfolio\n  - You've reached your profit target\n\n• **Consider Holding If**:\n  - Fundamentals remain strong\n  - Long-term growth story intact\n  - Tax implications favor holding\n\n• **Best Practice**: Avoid emotional decisions, stick to your plan`;
    }

    // Portfolio analysis
    if (
      lowerMessage.includes('review portfolio') ||
      lowerMessage.includes('review my portfolio') ||
      lowerMessage.includes('review holdings') ||
      lowerMessage.includes('portfolio analysis')
    ) {
      return `Based on your current portfolio, here's my analysis:\n\n• **Diversification**: Your portfolio shows good sector diversification\n• **Risk Level**: Moderate risk profile with balanced allocation\n• **Recommendation**: Consider rebalancing quarterly to maintain target allocation\n• **Top Holdings**: Your largest positions are performing well`;
    }

    // General greeting or help
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('help') ||
      lowerMessage.includes('what can you')
    ) {
      return `Hello, I'm here to help with your investment journey! I can assist you with:\n\n📊 **Portfolio Analysis** - Review your holdings and suggest optimizations\n💡 **Investment Recommendations** - Get personalized stock and ETF suggestions\n📈 **Market Insights** - Stay updated on trends and opportunities\n⚖️ **Risk Assessment** - Evaluate and manage your risk exposure\n📉 **Performance Tracking** - Analyze returns and benchmark comparisons`;
    }

    // Default intelligent response
    return `I didn't quite understand that. I can help with portfolio analysis, investment recommendations, market insights, risk assessment, and performance tracking. Could you rephrase your question?`;
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

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[900px] relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#edf9cd]/30 via-transparent to-[#083423]/5 pointer-events-none" />

      {/* Header */}
      <div className="relative mb-4">
        <Card className="" style={{}}>
          <CardContent className="px-5 py-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 hover:bg-[#083423]/10 rounded-full transition-all"
              >
                <ArrowLeft className="h-4 w-4" style={{ color: '#083423' }} />
              </Button>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  <div
                    className="rounded-2xl p-3 shadow-lg relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #edf9cd 0%, #d4e8a8 100%)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <Bot className="h-6 w-6 relative z-10" style={{ color: '#083423' }} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#083423] to-[#0a4d2e] bg-clip-text text-transparent">
                      Bluum AI
                    </h1>
                    <Badge
                      className="text-xs px-2.5 py-1 border-0 shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #083423 0%, #0a4d2e 100%)',
                        color: 'white',
                      }}
                    >
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      AI-Powered
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    Your intelligent investment advisor
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Area & Input Area - Combined */}
      <Card
        className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl relative"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(237, 249, 205, 0.3))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#083423]/5 pointer-events-none" />

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 items-start ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.role === 'assistant' && (
                <div className="relative flex-shrink-0">
                  <div
                    className="rounded-2xl p-2.5 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #edf9cd 0%, #d4e8a8 100%)',
                    }}
                  >
                    <Bot className="h-5 w-5" style={{ color: '#083423' }} />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-5 py-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#083423] to-[#0a4d2e] text-white'
                    : 'bg-white/90 backdrop-blur-sm text-[#083423] border border-[#edf9cd]'
                }`}
                style={{
                  boxShadow:
                    message.role === 'user'
                      ? '0 4px 20px rgba(8, 52, 35, 0.3)'
                      : '0 4px 20px rgba(8, 52, 35, 0.1)',
                }}
              >
                <div className="text-[15px] leading-relaxed font-medium">
                  {formatMessage(message.content)}
                </div>
                <p
                  className={`text-xs mt-3 font-medium ${
                    message.role === 'user' ? 'text-white/60' : 'text-[#083423]/50'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="rounded-full p-2 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 shadow-md">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start items-start animate-in fade-in">
              <div
                className="rounded-2xl p-2.5 shadow-lg flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #edf9cd 0%, #d4e8a8 100%)',
                }}
              >
                <Bot className="h-5 w-5" style={{ color: '#083423' }} />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 border border-[#edf9cd] shadow-lg">
                <div className="flex gap-2 items-center">
                  <div
                    className="h-2.5 w-2.5 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#083423',
                      animationDelay: '0ms',
                      animationDuration: '1s',
                    }}
                  />
                  <div
                    className="h-2.5 w-2.5 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#083423',
                      animationDelay: '200ms',
                      animationDuration: '1s',
                    }}
                  />
                  <div
                    className="h-2.5 w-2.5 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#083423',
                      animationDelay: '400ms',
                      animationDuration: '1s',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-[#edf9cd]/50 relative z-10">
          <CardContent className="p-5">
            <form onSubmit={handleSend} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your investments..."
                  className="w-full h-12 pl-4 pr-12 rounded-xl border-2 bg-white/80 backdrop-blur-sm focus-visible:border-[#083423] focus-visible:ring-2 focus-visible:ring-[#083423]/20 transition-all shadow-sm"
                  style={{ borderColor: '#edf9cd' }}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Zap className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-12 w-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #083423 0%, #0a4d2e 100%)'
                    : '#083423',
                  color: 'white',
                }}
              >
                <Send className="h-6 w-6" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <p className="font-medium">
                  Powered by advanced AI • Real-time insights • Personalized advice
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
