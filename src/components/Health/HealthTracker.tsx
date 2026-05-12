import React from 'react';
import { Droplets, Thermometer, Pill, Zap, AlertCircle } from 'lucide-react';
import { HealthLog } from '../../types';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface TrackerProps {
  logs: HealthLog[];
  onAddLog: (type: HealthLog['type'], value: any) => void;
  onSos: () => void;
}

export const HealthTracker: React.FC<TrackerProps> = ({ logs, onAddLog, onSos }) => {
  const todayRaw = new Date().setHours(0, 0, 0, 0);
  const todaysLogs = logs.filter(l => new Date(l.timestamp).setHours(0, 0, 0, 0) === todayRaw);

  const hydrationCount = todaysLogs.filter(l => l.type === 'hydration').length;
  const currentPain = todaysLogs.filter(l => l.type === 'pain').sort((a,b) => b.timestamp - a.timestamp)[0]?.value || 0;
  const currentEnergy = todaysLogs.filter(l => l.type === 'energy').sort((a,b) => b.timestamp - a.timestamp)[0]?.value || 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Energy Card (Featured) */}
      <div className="glass-card p-6 flex flex-col justify-between bg-white/40">
        <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest mb-4 opacity-60">Energia Diária</h3>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-light text-brand-brown-800 tracking-tighter">{currentEnergy}</span>
          <span className="text-lg text-brand-brown-800/30 pb-1">/ 10</span>
        </div>
        <div className="mt-4 flex gap-1.5">
          {[2, 4, 6, 8, 10].map(v => (
            <button 
              key={v}
              onClick={() => onAddLog('energy', v)} 
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                currentEnergy >= v ? "bg-brand-brown-800" : "bg-brand-tan/30 hover:bg-brand-tan/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Hydration Card */}
      <div className="glass-card p-6 flex flex-col justify-between bg-white/40">
        <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest mb-4 opacity-60">Acompanhamento</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-brand-brown-800">
            <span className="uppercase tracking-wide">Hidratação</span>
            <span className="tabular-nums">{hydrationCount * 0.25}L / 2.5L</span>
          </div>
          <div className="w-full bg-brand-tan/20 h-2.5 rounded-full overflow-hidden p-0.5 border border-brand-tan/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((hydrationCount * 0.25 / 2.5) * 100, 100)}%` }}
              className="bg-brand-terracotta h-full rounded-full shadow-[0_0_8px_rgba(203,87,54,0.3)]" 
            />
          </div>
          <button 
            onClick={() => onAddLog('hydration', 1)}
            className="w-full py-2.5 bg-brand-brown-800 text-brand-tan text-[10px] font-bold rounded-xl hover:bg-brand-brown-900 transition-all shadow-md shadow-brand-brown-800/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Droplets className="w-3 h-3" />
            ADICIONAR COPO (250ML)
          </button>
        </div>
      </div>

      {/* Pain Level Card */}
      <div className="glass-card p-6 flex flex-col justify-between bg-white/40 border-l-brand-terracotta border-l-4">
        <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest mb-4 opacity-60">Nível de Dor</h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[1,2,3,4,5,6,7,8,9,10].map(v => (
            <button
              key={v}
              onClick={() => onAddLog('pain', v)}
              className={cn(
                "w-7 h-7 rounded-lg text-[10px] font-bold transition-all border",
                currentPain === v 
                  ? "bg-brand-terracotta text-white border-brand-terracotta shadow-md shadow-brand-terracotta/20" 
                  : "bg-white text-brand-brown-800 border-brand-tan/30 hover:border-brand-terracotta"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-bold text-brand-brown-800 opacity-60 uppercase tracking-tight">
          {currentPain >= 7 ? "Crise detectada. Fique em alerta." : "Registre como se sente agora."}
        </p>
      </div>

      {/* Emergency Card (Special Highlight) */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="lg:col-span-3 bg-brand-brown-800 p-6 rounded-3xl shadow-xl shadow-brand-brown-800/20 text-brand-tan flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="text-center sm:text-left">
          <h3 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2">Protocolo de Segurança</h3>
          <p className="text-xl font-bold tracking-tight">Precisa de apoio imediato?</p>
          <p className="text-xs opacity-50 font-medium">Acione o plano de crise e seus contatos de confiança.</p>
        </div>
        <button 
          onClick={onSos}
          className="w-full sm:w-auto px-8 py-4 bg-brand-terracotta text-white rounded-2xl font-bold text-sm hover:bg-brand-terracotta/90 transition-all shadow-lg shadow-brand-terracotta/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          CANAL DE EMERGÊNCIA
        </button>
      </motion.div>
    </div>
  );
};
