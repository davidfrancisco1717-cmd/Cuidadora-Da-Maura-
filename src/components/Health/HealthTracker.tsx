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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Hydration */}
      <motion.div 
        whileHover={{ y: -2 }}
        onClick={() => onAddLog('hydration', 1)}
        className="glass-card p-4 cursor-pointer flex flex-col items-center justify-center text-center group transition-all hover:bg-white"
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <Droplets className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">Hidratação</span>
        <div className="text-xl font-serif font-bold text-blue-600">{hydrationCount} copos</div>
        <p className="text-[10px] text-gray-400 mt-1">Clique para somar</p>
      </motion.div>

      {/* Pain */}
      <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
          <Thermometer className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">Nível de Dor</span>
        <div className="flex gap-1 mt-1">
          {[1,2,3,4,5,6,7,8,9,10].map(v => (
            <button
              key={v}
              onClick={() => onAddLog('pain', v)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                currentPain >= v ? "bg-red-500 scale-110" : "bg-gray-200 hover:bg-red-200"
              )}
            />
          ))}
        </div>
        <div className="text-xl font-serif font-bold text-red-600 mt-2">{currentPain}/10</div>
      </div>

      {/* Energy */}
      <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center mb-2">
          <Zap className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">Energia</span>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${currentEnergy * 10}%` }}
            className="h-full bg-yellow-400"
          />
        </div>
        <div className="flex justify-between w-full mt-1">
           {[2, 4, 6, 8, 10].map(v => (
             <button 
              key={v}
              onClick={() => onAddLog('energy', v)} 
              className="text-[8px] hover:text-yellow-600 font-bold"
             >
               {v}
             </button>
           ))}
        </div>
      </div>

      {/* SOS / Emergency */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-red-600 p-4 rounded-3xl flex flex-col items-center justify-center text-center text-white shadow-lg shadow-red-200 cursor-pointer"
      >
        <AlertCircle className="w-8 h-8 mb-2" />
        <span className="text-xs font-bold uppercase">Ajuda Urgente</span>
        <p className="text-[10px] opacity-80">Crise Grave / Hospital</p>
      </motion.div>
    </div>
  );
};
