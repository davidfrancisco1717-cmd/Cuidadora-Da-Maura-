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
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Small timeout to ensure DOM update is complete
    const timeoutId = setTimeout(() => scrollToBottom('smooth'), 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden transition-all">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full space-y-6 flex flex-col min-h-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 max-w-sm mx-auto text-center animate-in fade-in zoom-in duration-700 py-10">
              <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-terracotta mb-6 shadow-sm border border-brand-tan/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-brand-brown-800 tracking-tight mb-8">
                Como posso te ajudar agora, <span className="italic">Maura</span>?
              </h2>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { label: "Relatar Dor", icon: "🩹" },
                  { label: "Beber Água", icon: "💧" },
                  { label: "Pedir Apoio", icon: "🫂" },
                  { label: "Ver Evolução", icon: "📈" },
                ].map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSendMessage(action.label)}
                    className="flex flex-col items-center gap-2 p-4 bg-brand-cream/30 border border-brand-tan/20 rounded-2xl hover:bg-brand-cream hover:border-brand-terracotta/30 transition-all group shadow-sm hover:shadow-md"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-800/60 group-hover:text-brand-brown-800">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-start gap-4",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm transition-transform hover:scale-110",
                m.role === 'user' ? "bg-brand-brown-800 text-brand-tan" : "bg-brand-tan text-brand-brown-800"
              )}>
                {m.role === 'user' ? 'M' : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  "p-5 rounded-3xl text-[15px] max-w-[80%] leading-relaxed shadow-sm transition-all",
                  m.role === 'user' 
                    ? "bg-brand-brown-800 text-white rounded-tr-none shadow-brand-brown-800/20" 
                    : "bg-white text-brand-brown-800 rounded-tl-none border border-brand-tan/10"
                )}
              >
                <div className={cn(
                  "prose prose-sm prose-p:leading-relaxed",
                  m.role === 'user' ? "text-white prose-invert" : "markdown-body"
                )}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-brand-brown-800/40 text-[10px] uppercase font-bold px-14"
            >
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-brand-terracotta/40 rounded-full animate-bounce [animation-duration:1s]" />
                <div className="w-1.5 h-1.5 bg-brand-terracotta/40 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-brand-terracotta/40 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
              </div>
              Maura está digitando...
            </motion.div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      <div className="p-6 bg-transparent">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-3xl mx-auto w-full group">
          <button 
            type="button" 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-brown-800/50 hover:bg-white hover:text-brand-terracotta transition-all border border-brand-tan/20 bg-brand-cream/30 shadow-none hover:shadow-md active:scale-95 group/plus shrink-0"
            title="Adicionar anexo ou contexto"
          >
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 m-auto w-4 h-0.5 bg-current rounded-full transition-transform group-hover/plus:rotate-90" />
              <div className="absolute inset-0 m-auto w-0.5 h-4 bg-current rounded-full transition-transform group-hover/plus:rotate-90" />
            </div>
          </button>
          
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Como posso te cuidar hoje?..."
              className="w-full pl-6 pr-14 py-4 bg-white border border-brand-tan/10 rounded-2xl text-sm focus:outline-none focus:border-brand-terracotta/30 focus:ring-4 focus:ring-brand-terracotta/5 transition-all placeholder:text-brand-brown-800/30 font-medium shadow-sm hover:shadow-md"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 w-10 bg-brand-brown-800 text-brand-tan rounded-xl flex items-center justify-center hover:bg-brand-brown-900 disabled:opacity-10 transition-all cursor-pointer shadow-lg shadow-brand-brown-800/10 active:scale-90"
            >
              <Send className="w-4 h-4 scale-x-[-1] -rotate-12 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
