/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Message, HealthLog, MauraProfile, AppState } from './types';
import { getChatResponse } from './services/geminiService';
import { Chat } from './components/Chat/Chat';
import { HealthTracker } from './components/Health/HealthTracker';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, User as UserIcon, Settings, Calendar, Info } from 'lucide-react';
import { cn } from './lib/utils';

const INITIAL_PROFILE: MauraProfile = {
  name: "Maura",
  hobbies: ["Ver filmes", "Ficar com o sobrinho", "Ouvir música"],
  dreams: ["Viagem para a praia", "Concluir curso"],
  triggers: ["Frio", "Estresse", "Desidratação"],
  medications: ["Hidroxiureia", "Ácido Fólico"],
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('maura_chat');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem('maura_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile] = useState<MauraProfile>(INITIAL_PROFILE);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  useEffect(() => {
    localStorage.setItem('maura_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('maura_logs', JSON.stringify(logs));
  }, [logs]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await getChatResponse(text, messages, profile, logs);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddLog = (type: HealthLog['type'], value: any) => {
    const newLog: HealthLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      value,
    };
    setLogs(prev => [...prev, newLog]);
    
    // Auto-prompt AI if pain is high
    if (type === 'pain' && value >= 7) {
      handleSendMessage(`Maura relatou dor nível ${value}. Dê orientações urgentes.`);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="p-6 md:p-8 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-warm mb-1"
          >
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Cuidado Diário</span>
          </motion.div>
          <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
            Olá, <span className="italic underline decoration-primary-soft/40">{profile.name}</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-md">
            Sua companheira está aqui para te apoiar com a saúde e bem-estar hoje.
          </p>
        </div>
        
        <div className="hidden md:flex gap-4">
           <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Settings className="w-5 h-5 text-gray-400" /></button>
           <div className="w-10 h-10 rounded-full bg-primary-soft/20 flex items-center justify-center border border-primary-soft/30">
             <UserIcon className="w-5 h-5 text-primary-warm" />
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tracking & Status */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-medium">Situação Atual</h3>
              <span className="text-[10px] text-gray-400 uppercase font-bold">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <HealthTracker logs={logs} onAddLog={handleAddLog} />
          </section>

          <section className="hidden md:block">
            <h3 className="font-serif text-xl font-medium mb-4">Lembretes & Conhecimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="glass-card p-5 border-l-4 border-l-primary-warm">
                 <h4 className="font-bold text-sm text-gray-800 mb-1 flex items-center gap-2">
                   <Info className="w-4 h-4 text-primary-warm" />
                   Dica de Hidratação
                 </h4>
                 <p className="text-xs text-gray-600 italic">Beber água ajuda a manter o sangue mais fluido, prevenindo crises de dor.</p>
               </div>
               <div className="glass-card p-5 border-l-4 border-l-secondary-warm">
                 <h4 className="font-bold text-sm text-gray-800 mb-1 flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-secondary-warm" />
                   Gatilhos Ativos
                 </h4>
                 <p className="text-xs text-gray-600">Atenção ao <span className="font-medium text-gray-800">frio</span> hoje. Mantenha-se agasalhada.</p>
               </div>
            </div>
          </section>
          
          <section className="bg-white rounded-3xl p-6 border border-gray-100 hidden md:block">
            <h3 className="font-serif text-xl font-medium mb-4">Seu Plano de Cuidado</h3>
            <div className="space-y-3">
              {profile.medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Pill className="w-4 h-4 text-gray-400" /></div>
                    <span className="text-sm font-medium">{med}</span>
                  </div>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold uppercase">Em dia</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1 h-[600px]">
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-100 flex justify-around p-4 z-50">
        <button onClick={() => setActiveTab('chat')} className={cn("flex flex-col items-center gap-1", activeTab === 'chat' ? "text-primary-warm font-bold" : "text-gray-400")}>
          <Heart className="w-6 h-6" />
          <span className="text-[10px] uppercase">Apoio</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={cn("flex flex-col items-center gap-1", activeTab === 'history' ? "text-primary-warm font-bold" : "text-gray-400")}>
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] uppercase">Histórico</span>
        </button>
      </div>
    </div>
  );
}

const Pill = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);
