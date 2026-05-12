/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Message, HealthLog, MauraProfile, AppState } from './types';
import { getChatResponse } from './services/geminiService';
import { Chat } from './components/Chat/Chat';
import { HealthTracker } from './components/Health/HealthTracker';
import { HealthSummary } from './components/Health/HealthSummary';
import { HealthCharts } from './components/Health/HealthCharts';
import { Sidebar } from './components/Navigation/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, User as UserIcon, Settings, Calendar, Menu } from 'lucide-react';
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

  const [profile, setProfile] = useState<MauraProfile>(() => {
    const saved = localStorage.getItem('maura_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'profile' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('maura_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('maura_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('maura_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfileFromText = (text: string) => {
    const lower = text.toLowerCase();
    const newProfile = { ...profile };
    let changed = false;

    // Basic extraction logic
    if (lower.includes("me chamo") || lower.includes("meu nome é")) {
      const match = text.match(/(me chamo|meu nome é) ([A-Za-zÀ-ú]+)/i);
      if (match && match[2]) {
        newProfile.name = match[2];
        changed = true;
      }
    }

    if (lower.includes("gosto de") || lower.includes("adoro")) {
      const match = text.match(/(gosto de|adoro) ([\w\s,]+)/i);
      if (match && match[2]) {
        const hobby = match[2].trim().substring(0, 30);
        if (!newProfile.hobbies.includes(hobby)) {
          newProfile.hobbies = [...newProfile.hobbies, hobby];
          changed = true;
        }
      }
    }

    if (changed) setProfile(newProfile);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    updateProfileFromText(text);

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
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-tan/10 px-6 md:px-8 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-brand-brown-800/60 hover:bg-brand-cream rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-brand-brown-800 tracking-tight">
                Olá, <span className="italic">{profile.name}</span>
              </h1>
              <p className="text-[10px] md:text-xs text-brand-terracotta font-bold uppercase tracking-widest">Especialista · Companheira</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex w-10 h-10 rounded-full bg-brand-tan items-center justify-center border-2 border-white shadow-sm">
              <UserIcon className="w-5 h-5 text-brand-brown-800" />
            </div>
            <button className="px-4 py-2 bg-brand-brown-800 text-white rounded-full text-[10px] font-bold shadow-lg shadow-brand-brown-800/20 active:scale-95 transition-all">SOS</button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="h-full w-full mx-auto overflow-hidden">
                {activeTab === 'chat' && (
                  <div className="h-full flex flex-col bg-brand-bg">
                    <Chat messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} />
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div className="h-full overflow-y-auto p-4 md:p-10 no-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-10">
                      <header>
                        <h2 className="text-2xl font-bold text-brand-brown-800">Sua Jornada de Saúde</h2>
                        <p className="text-sm text-brand-brown-800/60 mt-1">Acompanhe seu progresso e mantenha o controle.</p>
                      </header>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <HealthTracker logs={logs} onAddLog={handleAddLog} />
                        <HealthCharts logs={logs} />
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                          <HealthSummary logs={logs} profile={profile} />
                        </div>
                        <div className="space-y-8">
                          <section className="glass-card p-6 bg-brand-cream/50">
                            <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest mb-4 opacity-60">Fatos sobre Maura</h3>
                            <div className="flex flex-wrap gap-2">
                              {profile.hobbies.map((h, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-brand-tan/20 rounded-full text-[10px] font-bold text-brand-brown-800/70">
                                  <Heart className="w-3 h-3 inline mr-1 fill-brand-terracotta/20" /> {h}
                                </span>
                              ))}
                            </div>
                          </section>
                          <div className="glass-card p-6 border-l-4 border-l-brand-terracotta bg-white">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 text-brand-brown-800">Cuidado Diário</h4>
                            <div className="space-y-3">
                              {profile.medications.map((m, i) => (
                                 <div key={i} className="text-xs font-bold text-brand-brown-800 flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-brand-terracotta shadow-sm shadow-brand-terracotta/40" /> {m}
                                 </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="h-full overflow-y-auto p-4 md:p-10 no-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8">
                      <section className="glass-card p-10 bg-white shadow-xl shadow-brand-brown-800/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-terracotta via-brand-tan to-brand-brown-800" />
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="w-32 h-32 bg-brand-tan rounded-3xl flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                             <UserIcon className="w-16 h-16 text-brand-brown-800" />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h2 className="font-bold text-3xl text-brand-brown-800 mb-1">{profile.name}</h2>
                            <p className="text-sm text-brand-terracotta font-bold uppercase tracking-widest mb-4">Paciente de Anemia Falciforme</p>
                            <p className="text-sm text-brand-brown-800/60 leading-relaxed">
                              Bem-vinda Maura. Aqui é seu refúgio seguro. Cada dado registrado nos ajuda a cuidar melhor de você.
                            </p>
                          </div>
                        </div>
                      </section>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="glass-card p-8 bg-brand-cream/30">
                           <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-800 opacity-40 mb-4">Gatilhos Conhecidos</h3>
                           <div className="space-y-2">
                             {profile.triggers.map((t, i) => (
                               <div key={i} className="flex items-center gap-3 text-xs font-bold text-brand-brown-800/80 p-2 bg-white rounded-lg border border-brand-tan/10">
                                 <span className="text-brand-terracotta">⚠</span> {t}
                               </div>
                             ))}
                           </div>
                         </div>
                         <div className="glass-card p-8 bg-brand-cream/30">
                           <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-800 opacity-40 mb-4">Sonhos & Metas</h3>
                           <div className="space-y-2">
                             {profile.dreams.map((d, i) => (
                               <div key={i} className="flex items-center gap-3 text-xs font-bold text-brand-brown-800/80 p-2 bg-white rounded-lg border border-brand-tan/10">
                                 <span className="text-brand-terracotta">✨</span> {d}
                               </div>
                             ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="h-full overflow-y-auto p-4 md:p-10 no-scrollbar">
                    <div className="max-w-2xl mx-auto glass-card p-10 bg-white border border-brand-tan/20">
                      <h3 className="font-bold text-2xl text-brand-brown-800 mb-2">Configurações</h3>
                      <p className="text-sm text-brand-brown-800/60 mb-10">Controle suas preferências e dados pessoais.</p>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-brand-bg rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-brand-brown-800">Modo de Acessibilidade</p>
                            <p className="text-[10px] text-brand-brown-800/60 font-medium">Melhora o contraste e o tamanho da fonte.</p>
                          </div>
                          <div className="w-12 h-6 bg-brand-tan rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>

                        <div className="pt-10 border-t border-brand-tan/20">
                          <button 
                            onClick={() => { if(confirm('Apagar todos os dados? Esta ação não pode ser desfeita.')) { setMessages([]); setLogs([]); localStorage.clear(); location.reload(); }}}
                            className="w-full py-4 bg-brand-brown-800 text-brand-tan rounded-2xl font-bold text-xs shadow-lg shadow-brand-brown-800/20 active:scale-95 transition-all"
                          >
                            REDEFINIR APLICATIVO (LIMPAR TUDO)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const Pill = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);
