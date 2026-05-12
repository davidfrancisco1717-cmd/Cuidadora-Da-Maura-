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
import { HealthCalendar } from './components/Health/HealthCalendar';
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
  responseStyle: 'normal',
};

const Pill = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('maura_chat');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    try {
      const saved = localStorage.getItem('maura_logs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [profile, setProfile] = useState<MauraProfile>(() => {
    try {
      const saved = localStorage.getItem('maura_profile');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch { return INITIAL_PROFILE; }
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
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

    // Name extraction
    if (lower.includes("me chamo") || lower.includes("meu nome é")) {
      const match = text.match(/(me chamo|meu nome é) ([A-Za-zÀ-ú]+)/i);
      if (match && match[2]) {
        newProfile.name = match[2];
        changed = true;
      }
    }

    // Hobbies extraction
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

    // Dreams extraction
    if (lower.includes("sonho") || lower.includes("quero ser")) {
      const match = text.match(/(sonho|quero ser) ([\w\s,]+)/i);
      if (match && match[2]) {
        const dream = match[2].trim().substring(0, 45);
        if (!newProfile.dreams.includes(dream)) {
          newProfile.dreams = [...newProfile.dreams, dream];
          changed = true;
        }
      }
    }

    // Medications extraction
    if (lower.includes("tomo") || lower.includes("medicação") || lower.includes("remédio")) {
      const medications = ["hidroxiureia", "ácido fólico", "dipirona", "paracetamol"];
      medications.forEach(med => {
        if (lower.includes(med) && !newProfile.medications.some(m => m.toLowerCase() === med)) {
          newProfile.medications = [...newProfile.medications, med.charAt(0).toUpperCase() + med.slice(1)];
          changed = true;
        }
      });
    }

    // Triggers extraction
    if (lower.includes("crise") || lower.includes("dor")) {
      const triggers = ["frio", "estresse", "calor", "desidratação", "atividade física"];
      triggers.forEach(trigger => {
        if (lower.includes(trigger) && !newProfile.triggers.some(t => t.toLowerCase() === trigger)) {
          newProfile.triggers = [...newProfile.triggers, trigger.charAt(0).toUpperCase() + trigger.slice(1)];
          changed = true;
        }
      });
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
    <div className="flex h-screen bg-brand-bg overflow-hidden justify-center items-stretch font-sans">
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-bg flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-brand-brown-800 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-brand-brown-800 tracking-tighter">Maura</h1>
            <p className="text-[10px] text-brand-terracotta font-bold uppercase tracking-[0.3em] mt-2">Cuidado Especializado</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full max-w-7xl h-full bg-brand-paper shadow-2xl relative overflow-hidden md:m-4 md:rounded-[2.5rem] border border-brand-tan/10">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-brand-paper relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-terracotta/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          {/* Header */}
          <header className="h-20 bg-brand-brown-800 px-6 md:px-10 flex items-center justify-between shrink-0 z-50 text-brand-cream relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-brown-900 to-brand-brown-800 opacity-50" />
            
            <div className="flex items-center gap-4 relative z-10">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-brand-cream/60 hover:bg-brand-brown-700 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-brand-tan rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/10"
                >
                  <div className="text-brand-brown-900"><Pill className="w-7 h-7" /></div>
                </motion.div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tighter">
                    Maura
                  </h1>
                  <p className="text-[10px] text-brand-tan font-bold uppercase tracking-widest leading-none opacity-80">Companheira de Cuidado</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="hidden md:flex flex-col items-end mr-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-brand-tan">Paciente</p>
                <p className="text-xs font-bold text-brand-cream">{profile.name}</p>
              </div>
              <div className="hidden md:flex w-12 h-12 rounded-2xl bg-brand-tan/10 items-center justify-center border border-brand-tan/20 shadow-inner group cursor-pointer hover:bg-brand-tan/20 transition-all">
                <UserIcon className="w-6 h-6 text-brand-tan group-hover:scale-110 transition-transform" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: ["0 0 0 0 rgba(201, 126, 74, 0)", "0 0 0 10px rgba(201, 126, 74, 0.1)", "0 0 0 20px rgba(201, 126, 74, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-6 py-2.5 bg-brand-terracotta text-white rounded-2xl text-[10px] font-bold shadow-lg shadow-brand-terracotta/40 hover:shadow-brand-terracotta/60 transition-all uppercase tracking-widest relative z-10"
              >
                SOS
              </motion.button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="h-full w-full mx-auto overflow-hidden">
                  {activeTab === 'chat' && (
                    <div className="h-full flex flex-col bg-brand-paper">
                      <Chat 
                        messages={messages} 
                        onSendMessage={handleSendMessage} 
                        isTyping={isTyping} 
                        profile={profile}
                        onUpdateProfile={(p) => setProfile(p)}
                      />
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
                          <HealthCalendar logs={logs} />
                          <div className="lg:col-span-2">
                             <HealthCharts logs={logs} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2">
                            <HealthSummary logs={logs} profile={profile} />
                          </div>
                          <div className="space-y-8">
                            <section className="glass-card p-6 bg-brand-cream/50">
                              <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest mb-4 opacity-60">Fatos sobre {profile.name}</h3>
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

                  {/* ... (rest of simple tabs) ... */}
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
                                Bem-vinda {profile.name}. Aqui é seu refúgio seguro. Cada dado registrado nos ajuda a cuidar melhor de você.
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

          {/* Global Footer */}
          <footer className="shrink-0 py-2 px-6 bg-brand-cream border-t border-brand-tan/20 text-center">
            <p className="text-[9px] text-brand-terracotta font-bold uppercase tracking-widest">
              ⚠️ Febre acima de 38°C ou dor intensa: procure atendimento médico imediatamente.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
