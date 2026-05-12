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
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-brand-slate-200 overflow-hidden">
      <div className="p-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-teal-600" />
          <span className="text-sm font-semibold text-brand-slate-600">Sua Companheira</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Online
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20 opacity-40 flex flex-col items-center gap-3">
            <Bot className="w-12 h-12 text-brand-teal-600" />
            <p className="text-sm font-medium">"Oi Maura, como está sua energia hoje?"</p>
          </div>
        )}
        
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-start gap-3",
              m.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
              m.role === 'user' ? "bg-brand-teal-900 text-white" : "bg-brand-teal-100 text-brand-teal-600"
            )}>
              {m.role === 'user' ? 'M' : 'AI'}
            </div>
            <div
              className={cn(
                "p-4 rounded-2xl text-sm max-w-[85%]",
                m.role === 'user' 
                  ? "bg-brand-teal-600 text-white rounded-tr-none shadow-sm" 
                  : "bg-brand-slate-100 text-brand-slate-800 rounded-tl-none"
              )}
            >
              <div className="markdown-body">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-brand-slate-400 text-[10px] uppercase font-bold px-11"
          >
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-brand-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-brand-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-brand-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
            Digitando
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-brand-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva como você está se sentindo..."
            className="w-full pl-4 pr-12 py-3 bg-brand-slate-50 border border-brand-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-teal-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 w-8 h-8 bg-brand-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-brand-teal-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['Dor moderada', 'Preciso de apoio', 'Protocolo de crise'].map(hint => (
            <button
              key={hint}
              type="button"
              onClick={() => setInput(hint)}
              className="whitespace-nowrap px-3 py-1 bg-brand-slate-100 text-brand-slate-600 text-[10px] font-medium rounded-full border border-brand-slate-200 hover:bg-brand-slate-200 transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
