import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-bottom border-gray-100 flex items-center gap-2 bg-primary-warm/5">
        <Sparkles className="w-5 h-5 text-primary-warm" />
        <h2 className="font-serif text-lg font-medium text-gray-800">Sua Companheira</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-50 flex flex-col items-center gap-2">
            <Bot className="w-10 h-10" />
            <p className="font-serif italic">"Olá Maura, como você está se sentindo hoje?"</p>
          </div>
        )}
        
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "p-4 rounded-2xl text-sm",
                m.role === 'user' 
                  ? "bg-primary-warm text-white rounded-tr-none" 
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              )}
            >
              <div className="markdown-body">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
              {m.role === 'user' ? 'Você' : 'Companheira'}
            </span>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400 text-xs italic"
          >
            <Bot className="w-4 h-4 animate-pulse" />
            Digitando...
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Diga algo para a Maura..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-warm/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-primary-warm text-white p-2 rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
