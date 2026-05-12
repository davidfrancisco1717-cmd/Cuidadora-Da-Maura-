import React from 'react';
import { Droplets, Thermometer, Pill, Zap, AlertCircle } from 'lucide-react';
import { HealthLog } from '../../types';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface TrackerProps {
  logs: HealthLog[];
  onAddLog: (type: HealthLog['type'], value: any) => void;
}

export const HealthTracker: React.FC<TrackerProps> = ({ logs, onAddLog }) => {
  const todayRaw = new Date().setHours(0, 0, 0, 0);
  const todaysLogs = logs.filter(l => new Date(l.timestamp).setHours(0, 0, 0, 0) === todayRaw);

  const hydrationCount = todaysLogs.filter(l => l.type === 'hydration').length;
  const currentPain = todaysLogs.filter(l => l.type === 'pain').sort((a,b) => b.timestamp - a.timestamp)[0]?.value || 0;
  const currentEnergy = todaysLogs.filter(l => l.type === 'energy').sort((a,b) => b.timestamp - a.timestamp)[0]?.value || 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Energy Card (Featured) */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <h3 className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mb-4">Energia Diária</h3>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-light text-brand-teal-600">{currentEnergy}</span>
          <span className="text-lg text-brand-slate-400 pb-1">/ 10</span>
        </div>
        <div className="mt-4 flex gap-1">
          {[2, 4, 6, 8, 10].map(v => (
            <button 
              key={v}
              onClick={() => onAddLog('energy', v)} 
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                currentEnergy >= v ? "bg-brand-teal-500" : "bg-brand-slate-100 hover:bg-brand-teal-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Hydration Card */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <h3 className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mb-4">Acompanhamento</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-slate-600">Hidratação</span>
            <span className="font-semibold">{hydrationCount * 0.25}L / 2.5L</span>
          </div>
          <div className="w-full bg-brand-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((hydrationCount * 0.25 / 2.5) * 100, 100)}%` }}
              className="bg-brand-teal-500 h-full rounded-full" 
            />
          </div>
          <button 
            onClick={() => onAddLog('hydration', 1)}
            className="w-full py-2 bg-brand-teal-50 text-brand-teal-700 text-xs font-bold rounded-lg border border-brand-teal-100 hover:bg-brand-teal-100 transition-colors"
          >
            ADICIONAR COPO (250ML)
          </button>
        </div>
      </div>

      {/* Pain Level Card */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <h3 className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mb-4">Nível de Dor</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1,2,3,4,5,6,7,8,9,10].map(v => (
            <button
              key={v}
              onClick={() => onAddLog('pain', v)}
              className={cn(
                "w-7 h-7 rounded-lg text-[10px] font-bold transition-all border",
                currentPain === v 
                  ? "bg-brand-slate-800 text-white border-brand-slate-800" 
                  : "bg-white text-brand-slate-400 border-brand-slate-200 hover:border-brand-teal-500"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-xs text-brand-slate-500 italic">
          {currentPain >= 7 ? "Crise detectada. Considere emergência." : "Continue registrando sua percepção."}
        </p>
      </div>

      {/* Emergency Card (Special Highlight) */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="lg:col-span-3 bg-brand-slate-900 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between"
      >
        <div>
          <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Canal de Emergência</h3>
          <p className="text-xl font-medium">Precisa de ajuda agora?</p>
          <p className="text-sm opacity-60">Acionamento de protocolo de crise e contatos.</p>
        </div>
        <button className="px-8 py-3 bg-white text-brand-slate-900 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all">
          CONTATO URGENTE
        </button>
      </motion.div>
    </div>
  );
};
