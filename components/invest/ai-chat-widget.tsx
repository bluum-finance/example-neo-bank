'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AIChatWidgetProps {
  onChatStart?: (message?: string) => void;
}

const SUGGESTED_PROMPTS = [
  'What is the current market outlook and key trends?',
  'What are the best investment opportunities right now?',
];

export function AIChatWidget({ onChatStart }: AIChatWidgetProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSend();
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      if (onChatStart) {
        onChatStart(inputValue.trim());
      } else {
        router.push(`/invest/chat?message=${encodeURIComponent(inputValue.trim())}`);
      }
      setInputValue('');
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (onChatStart) {
      onChatStart(prompt);
    } else {
      router.push(`/invest/chat?message=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="w-full flex flex-col items-center gap-8">
          {/* Avatar Section */}
          <div className="relative flex flex-col items-start">
            {/* Blur background effect */}
            <div
              className="absolute left-0 top-0 w-32 h-32 rounded-full"
              style={{
                background: 'rgba(34, 197, 94, 0.30)',
                boxShadow: '64px 64px 64px',
                borderRadius: '9999px',
                filter: 'blur(32px)',
              }}
            />
            {/* Avatar circle */}
            <div
              className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: '0px 0px 40px -10px rgba(34, 197, 94, 0.15)',
                borderRadius: 9999,
                outline: '4px rgba(255, 255, 255, 0.20) solid',
                outlineOffset: '-4px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))',
              }}
            >
              {/* Letter "b" */}
              <div
                className="flex flex-col items-start justify-center text-[43.70px] font-bold italic leading-[60px]"
                style={{
                  fontFamily: 'Inter',
                  color: 'rgba(85.18, 85.18, 85.18, 0.3)',
                }}
              >
                b
              </div>
              {/* Shine effect */}
              <div
                className="absolute w-44 h-32"
                style={{
                  left: '47.03px',
                  top: '-27.48px',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'top left',
                  opacity: 0.5,
                  background: 'linear-gradient(45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(255, 255, 255, 0) 100%)',
                  boxShadow: '16px 16px 16px',
                  filter: 'blur(8px)',
                }}
              />
            </div>
          </div>

          {/* Input Section */}
          <div className="w-full relative flex items-center justify-center">
            <div className="flex-1 h-14 relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleInputKeyPress}
                placeholder="Ask AI"
                className="w-full text-base h-full pl-14 pr-16 py-5 bg-card rounded-full outline outline-1 outline-gray-200 dark:outline-border text-gray-700 dark:text-foreground font-light placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:outline-2 focus:outline-[#4F46E5] dark:focus:outline-[#6366F1] transition-all"
                style={{
                  fontFamily: 'Inter',
                }}
              />
              {/* Sparkles icon on left */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              </div>
              {/* Send icon on right */}
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-9 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                <Send className="w-5 h-5 text-gray-400 dark:text-muted-foreground rotate-[-12deg]" />
              </button>
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-4">
            <div className="w-full flex flex-col items-center gap-4">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-1.5 bg-card cursor-pointer rounded-full outline outline-1 outline-gray-200 dark:outline-border outline-offset-[-1px] hover:bg-gray-50 dark:hover:bg-accent transition-colors"
                >
                  <span
                    className="text-center text-gray-700 dark:text-foreground text-xs font-normal leading-5"
                    style={{
                      fontFamily: 'Inter',
                    }}
                  >
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
