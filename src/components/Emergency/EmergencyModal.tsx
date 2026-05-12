import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, ShieldAlert, Heart, MapPin, Ambulance } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, profile }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-brown-900/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-auto md:w-[600px] md:left-1/2 md:-translate-x-1/2 bg-white rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden flex flex-col border-4 border-brand-terracotta"
          >
            <div className="bg-brand-terracotta p-8 text-white flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert className="w-8 h-8 animate-pulse text-white fill-current" />
                  <h2 className="text-3xl font-bold tracking-tighter">Protocolo de SOS</h2>
                </div>
                <p className="text-sm font-medium opacity-80 decoration-white/20 underline underline-offset-4">Em caso de crise vaso-oclusiva grave ou febre alta</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                id="close-emergency-modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-brand-bg/30">
              {/* Emergency Contacts */}
              <section>
                <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest mb-4 opacity-40">Contatos de Emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href="tel:192" 
                    className="flex items-center gap-4 p-5 bg-white rounded-3xl border-2 border-brand-terracotta/20 hover:border-brand-terracotta transition-all group"
                  >
                    <div className="w-12 h-12 bg-brand-terracotta/10 rounded-2xl flex items-center justify-center text-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white transition-colors shadow-sm">
                      <Ambulance className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-brown-800">SAMU</p>
                      <p className="text-sm font-black text-brand-terracotta">192</p>
                    </div>
                  </a>
                  <a 
                    href="tel:193" 
                    className="flex items-center gap-4 p-5 bg-white rounded-3xl border-2 border-brand-terracotta/20 hover:border-brand-terracotta transition-all group"
                  >
                    <div className="w-12 h-12 bg-brand-terracotta/10 rounded-2xl flex items-center justify-center text-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white transition-colors shadow-sm">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-brown-800">Bombeiros</p>
                      <p className="text-sm font-black text-brand-terracotta">193</p>
                    </div>
                  </a>
                </div>
              </section>

              {/* Personal Info to Show to Medics */}
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-tan/10 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-brand-tan/10">
                  <div className="w-10 h-10 bg-brand-tan rounded-2xl flex items-center justify-center text-brand-brown-800">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <h4 className="font-bold text-brand-brown-800">Informações Críticas para Médicos</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-brand-brown-800/40 uppercase tracking-widest block mb-1">Diagnóstico</label>
                    <p className="text-sm font-bold text-brand-brown-800 uppercase">Doença Falciforme</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-brand-brown-800/40 uppercase tracking-widest block mb-1">Paciente</label>
                    <p className="text-sm font-bold text-brand-brown-800">{profile.name}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-brand-brown-800/40 uppercase tracking-widest block mb-1">Medicações de Uso Contínuo</label>
                  <p className="text-xs font-medium text-brand-brown-800/70 leading-relaxed">
                    {profile.medications.join(', ')}
                  </p>
                </div>

                <div className="p-4 bg-brand-terracotta/5 rounded-2xl border border-brand-terracotta/10">
                  <p className="text-[10px] font-bold text-brand-terracotta uppercase tracking-[0.2em] mb-2 leading-none flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Hospital de Preferência
                  </p>
                  <p className="text-xs font-bold text-brand-brown-800">Unidade de Hematologia (HEMO)</p>
                </div>
              </section>

              <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-200">
                 <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                  <span className="font-black block text-sm mb-1">⚠️ ORIENTAÇÃO PARA CRISES:</span>
                  Evite esforço físico, mantenha-se aquecida e beba muita água até chegar ao hospital. Não espere a dor se tornar insuportável para buscar ajuda.
                </p>
              </div>
            </div>

            <div className="p-8 bg-brand-bg border-t border-brand-tan/10 shrink-0">
               <button 
                onClick={onClose}
                className="w-full py-4 bg-brand-brown-800 text-brand-tan font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
               >
                 Entendi e Voltar
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
