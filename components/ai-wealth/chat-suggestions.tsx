'use client';

import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  'What is the current market outlook and key trends?',
  'Analyze my portfolio performance',
  'What is my risk level?',
  'What are the best investment opportunities right now?',
];

export function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      {/* Animated AI Visual */}
      <div className="relative w-24 h-24">
        {/* Outer pulsing ring */}
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: '#edf9cd',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* Rotating gradient ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, #edf9cd, #083423, #edf9cd)',
            animationDuration: '3s',
            mask: 'radial-gradient(circle, transparent 60%, black 60%)',
            WebkitMask: 'radial-gradient(circle, transparent 60%, black 60%)',
          }}
        />

        {/* Inner pulsing circle */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #edf9cd, rgba(237, 249, 205, 0.3))',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Center icon with glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative rounded-full p-8"
            style={{
              background: 'linear-gradient(135deg, #083423, rgba(8, 52, 35, 0.8))',
              boxShadow: '0 0 20px rgba(8, 52, 35, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <Bot className="h-5 w-5 text-white relative z-10" />
            <Sparkles
              className="h-3 w-3 absolute -top-1 -right-1 text-[#edf9cd]"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />
          </div>
        </div>

        {/* Orbiting particles */}
        {[...Array(6)].map((_, i) => {
          const angle = i * 60 * (Math.PI / 180);
          const radius = 40;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: '4px',
                height: '4px',
                background: '#083423',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${
                  i * 60
                }deg) translateY(-${radius}px)`,
                animation: `spin ${3 + i * 0.2}s linear infinite`,
                opacity: 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Suggestion Questions */}
      <div className="w-full max-w-2xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {SUGGESTIONS.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full h-auto py-4 px-0 rounded-xl border hover:bg-[#edf9cd]/50 transition-all bg-white/80 backdrop-blur-sm"
              style={{ borderColor: '#edf9cd' }}
              onClick={() => onSuggestionClick(suggestion)}
            >
              <span
                className="text-xs sm:text-sm font-medium px-4 sm:px-5 text-left break-words"
                style={{ color: '#083423' }}
              >
                {suggestion}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
