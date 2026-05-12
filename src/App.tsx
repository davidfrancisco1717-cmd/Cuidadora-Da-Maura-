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
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'profile' | 'settings'>('chat');

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
    
    if (type === 'pain' && value >= 7) {
      handleSendMessage(`Maura relatou dor nível ${value}. Dê orientações urgentes.`);
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      {/* Sidebar Navigation - Desktop */}
      <aside className="w-64 bg-white border-r border-brand-slate-200 hidden md:flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand-teal-600 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-teal-900">Maura.ai</span>
        </div>
        
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('chat')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm", activeTab === 'chat' ? "sidebar-item-active" : "sidebar-item-inactive")}>
            <Heart className="w-4 h-4" />
            <span>Principal</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm", activeTab === 'history' ? "sidebar-item-active" : "sidebar-item-inactive")}>
            <Calendar className="w-4 h-4" />
            <span>Saúde e Protocolos</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm", activeTab === 'profile' ? "sidebar-item-active" : "sidebar-item-inactive")}>
            <UserIcon className="w-4 h-4" />
            <span>Meu Perfil</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm", activeTab === 'settings' ? "sidebar-item-active" : "sidebar-item-inactive")}>
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </nav>

        <div className="mt-auto">
          <div className="p-4 bg-brand-slate-100 rounded-xl">
            <p className="text-[10px] font-bold text-brand-slate-500 uppercase tracking-widest mb-2">Segurança</p>
            <p className="text-[10px] text-brand-slate-600 leading-relaxed">Seus dados de saúde estão criptografados e protegidos.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-brand-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold text-brand-slate-900 tracking-tight">Olá, {profile.name}</h1>
            <p className="text-xs text-brand-slate-500 font-medium">Como está sua energia hoje?</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block px-4 py-2 border border-brand-teal-200 text-brand-teal-700 rounded-lg text-xs font-bold hover:bg-brand-teal-50 transition-colors">Emergência</button>
            <div className="w-10 h-10 rounded-full bg-brand-slate-100 border border-brand-slate-200 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-brand-slate-400" />
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <section className="flex-1 p-6 md:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
          {/* Left Column: Tracking */}
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 no-scrollbar">
            <section>
              <HealthTracker logs={logs} onAddLog={handleAddLog} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-brand-teal-600">
                <div className="flex items-center gap-2 text-brand-teal-700 mb-2">
                  <Info className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Dica de Hidratação</h4>
                </div>
                <p className="text-sm text-brand-slate-600 leading-relaxed italic">Beber água ajuda a manter o sangue mais fluido, prevenindo crises de dor.</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-brand-teal-900">
                <div className="flex items-center gap-2 text-brand-teal-900 mb-2">
                  <Calendar className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Gatilhos Ativos</h4>
                </div>
                <p className="text-sm text-brand-slate-600 leading-relaxed">Atenção ao <span className="font-bold text-brand-slate-800 underline decoration-brand-teal-200">frio</span> hoje. Mantenha-se agasalhada.</p>
              </div>
            </div>

            <section className="glass-card p-6">
              <h3 className="text-sm font-bold text-brand-slate-400 uppercase tracking-widest mb-4">Seu Plano de Cuidado</h3>
              <div className="space-y-3">
                {profile.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-brand-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-slate-50 flex items-center justify-center text-brand-slate-400">
                         <Pill className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-brand-slate-700">{med}</span>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase">Tomado</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: AI Chat */}
          <div className="w-full lg:w-[400px] h-[500px] lg:h-full shrink-0">
            <Chat 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
        </section>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-brand-slate-200 md:hidden flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('chat')} 
          className={cn("flex flex-col items-center gap-1", activeTab === 'chat' ? "text-brand-teal-600" : "text-brand-slate-400")}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Apoio</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={cn("flex flex-col items-center gap-1", activeTab === 'history' ? "text-brand-teal-600" : "text-brand-slate-400")}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Histórico</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={cn("flex flex-col items-center gap-1", activeTab === 'profile' ? "text-brand-teal-600" : "text-brand-slate-400")}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Perfil</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={cn("flex flex-col items-center gap-1", activeTab === 'settings' ? "text-brand-teal-600" : "text-brand-slate-400")}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}

const Pill = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);
