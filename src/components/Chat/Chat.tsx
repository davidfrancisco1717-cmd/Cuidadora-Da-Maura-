import React, { useState, useRef, useEffect } from 'react';
import { Message, MauraProfile } from '../../types';
import { Send, User, Bot, Sparkles, Database, ChevronDown, Wand2, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  profile: MauraProfile;
  onUpdateProfile: (profile: MauraProfile) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isTyping, profile, onUpdateProfile }) => {
  const [input, setInput] = useState('');
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
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

  const cycleStyle = () => {
    const styles: MauraProfile['responseStyle'][] = ['normal', 'terapeuta', 'amiga', 'coach', 'direta'];
    const currentIndex = styles.indexOf(profile.responseStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    onUpdateProfile({ ...profile, responseStyle: styles[nextIndex] });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden transition-all relative">
      {/* Memory Panel */}
      <div className="flex-shrink-0 z-40">
        <button 
          onClick={() => setIsMemoryOpen(!isMemoryOpen)}
          className="w-full px-6 py-3 bg-brand-cream/30 border-b border-brand-tan/10 flex items-center justify-between hover:bg-brand-cream/50 transition-all text-brand-brown-800"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-terracotta" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Memória de Cuidado</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isMemoryOpen && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isMemoryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-brand-cream/20 border-b border-brand-tan/10 overflow-hidden"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <MemoryChip icon={<User className="w-3 h-3" />} label="Nome" value={profile.name} />
                <MemoryChip icon={<Heart className="w-3 h-3" />} label="Hobbies" value={profile.hobbies.join(', ')} />
                <MemoryChip icon={<Database className="w-3 h-3" />} label="Gatilhos" value={profile.triggers.join(', ')} />
                <MemoryChip icon={<Bot className="w-3 h-3" />} label="Medicações" value={profile.medications.join(', ')} />
                <MemoryChip icon={<Sparkles className="w-3 h-3" />} label="Sonhos" value={profile.dreams[0]} />
                <button 
                  onClick={cycleStyle}
                  className="flex items-center gap-3 p-3 bg-white border border-brand-tan/20 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-terracotta/30 transition-all text-left group"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white transition-colors">
                    <Wand2 className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Estilo</p>
                    <p className="text-xs font-bold text-brand-brown-800 capitalize">{profile.responseStyle}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-brand-bg/50">
        <div className="max-w-4xl mx-auto w-full space-y-6 flex flex-col min-h-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 max-w-sm mx-auto text-center animate-in fade-in zoom-in duration-700 py-10">
              <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-terracotta mb-6 shadow-md border border-brand-tan/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-brand-brown-800 tracking-tight mb-8">
                Como posso te ajudar agora, <span className="italic">{profile.name}</span>?
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
                    className="flex flex-col items-center gap-2 p-4 bg-white border border-brand-tan/10 rounded-2xl hover:bg-brand-cream hover:border-brand-terracotta/30 transition-all group shadow-sm hover:shadow-md"
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
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm transition-transform hover:scale-110 border-2 border-white",
                m.role === 'user' ? "bg-brand-brown-800 text-brand-tan" : "bg-brand-tan text-brand-brown-800"
              )}>
                {m.role === 'user' ? profile.name.charAt(0) : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={cn(
                  "p-5 rounded-3xl text-[15px] max-w-[80%] leading-relaxed shadow-sm transition-all relative overflow-hidden",
                  m.role === 'user' 
                    ? "bg-brand-brown-800 text-white rounded-tr-none shadow-brand-brown-800/20" 
                    : "bg-white text-brand-brown-800 rounded-tl-none border border-brand-tan/10"
                )}
              >
                <div className={cn(
                  "prose prose-sm prose-p:leading-relaxed max-w-none",
                  m.role === 'user' ? "text-white prose-invert" : "text-brand-brown-800"
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
          <div ref={bottomRef} className="h-6" />
        </div>
      </div>

      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-brand-tan/10 shadow-[0_-10px_30px_rgba(92,64,51,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 group">
            <button 
              type="button" 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-brown-800/50 hover:bg-brand-cream hover:text-brand-terracotta transition-all border border-brand-tan/20 bg-brand-cream/30 shadow-none hover:shadow-md active:scale-95 group/plus shrink-0"
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
                placeholder="Conte para a Maura sobre seu dia..."
                className="w-full pl-6 pr-14 py-4 bg-brand-bg border border-brand-tan/20 rounded-2xl text-sm focus:outline-none focus:border-brand-terracotta/30 focus:ring-4 focus:ring-brand-terracotta/5 transition-all placeholder:text-brand-brown-800/20 font-medium shadow-sm hover:shadow-md"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 w-10 bg-brand-brown-800 text-brand-tan rounded-xl flex items-center justify-center hover:bg-brand-brown-900 disabled:opacity-10 transition-all cursor-pointer shadow-lg shadow-brand-brown-800/10 active:scale-90"
              >
                <Send className="w-4 h-4 scale-x-[-1] -rotate-12 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldAlert className="w-3 h-3 text-brand-terracotta" />
            <p className="text-[10px] text-brand-terracotta/60 font-bold uppercase tracking-wider">
              ⚠️ Em caso de febre ou dor intensa, procure atendimento médico.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const MemoryChip = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-brand-tan/20 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="w-6 h-6 rounded-full bg-brand-tan/20 flex items-center justify-center text-brand-brown-800/60">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">{label}</p>
        <p className="text-xs font-bold text-brand-brown-800 truncate max-w-[150px]">{value}</p>
      </div>
    </div>
  );
};

