import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, Info } from 'lucide-react';
import { HealthLog } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface HealthCalendarProps {
  logs: HealthLog[];
}

export const HealthCalendar: React.FC<HealthCalendarProps> = ({ logs }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayLogs = (day: Date) => {
    return logs.filter(log => isSameDay(new Date(log.timestamp), day));
  };

  const getPainLevel = (dayLogs: HealthLog[]) => {
    const painLogs = dayLogs.filter(log => log.type === 'pain');
    if (painLogs.length === 0) return 0;
    return Math.max(...painLogs.map(l => l.value));
  };

  return (
    <div className="glass-card overflow-hidden bg-white/40 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-brand-tan/10 flex items-center justify-between bg-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-brown-800 flex items-center justify-center text-brand-tan shadow-lg">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-brown-800 tracking-tight capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <p className="text-[10px] text-brand-brown-800/40 font-bold uppercase tracking-widest">Histórico de Cuidado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-brand-tan/20 rounded-lg transition-colors text-brand-brown-800/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-brand-tan/20 rounded-lg transition-colors text-brand-brown-800/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 flex-1">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(day => (
            <div key={day} className="text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-brown-800/30">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayLogs = getDayLogs(day);
            const painLevel = getPainLevel(dayLogs);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const activeToday = isToday(day);

            return (
              <motion.div
                key={day.toString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                className={cn(
                  "aspect-[4/5] rounded-xl relative flex flex-col p-1 transition-all border border-transparent group",
                  !isCurrentMonth && "opacity-20",
                  isCurrentMonth && "hover:bg-white hover:shadow-md hover:border-brand-tan/20 cursor-default",
                  activeToday && "bg-brand-tan/10 border-brand-tan/30"
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold mb-1",
                  activeToday ? "text-brand-terracotta" : "text-brand-brown-800/40"
                )}>
                  {format(day, 'd')}
                </span>

                <div className="flex-1 flex flex-col items-center justify-center gap-1">
                  {painLevel > 0 && (
                    <motion.div 
                      layoutId={`pain-${day.getTime()}`}
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
                        painLevel >= 8 ? "bg-red-500 text-white" :
                        painLevel >= 5 ? "bg-orange-400 text-white" :
                        "bg-brand-terracotta text-white"
                      )}
                    >
                      <Activity className="w-2.5 h-2.5" />
                    </motion.div>
                  )}
                  
                  <div className="flex gap-0.5">
                    {dayLogs.some(l => l.type === 'hydration') && (
                      <div className="w-1 h-1 bg-blue-400 rounded-full" />
                    )}
                    {dayLogs.some(l => l.type === 'energy') && (
                      <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                    )}
                  </div>
                </div>

                {isCurrentMonth && dayLogs.length > 0 && (
                  <div className="absolute inset-0 bg-brand-brown-800/90 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none flex flex-col justify-center">
                    <p className="text-[8px] font-bold uppercase opacity-60">Registros:</p>
                    <p className="text-[10px] font-medium truncate">
                      {dayLogs.length} eventos
                    </p>
                    {painLevel > 0 && (
                      <p className="text-[9px] text-brand-tan font-bold mt-1">Dor: {painLevel}/10</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-brand-tan/10 flex items-center justify-center gap-6 bg-brand-cream/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-terracotta" />
          <span className="text-[9px] font-bold text-brand-brown-800/60 uppercase tracking-widest">Dor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[9px] font-bold text-brand-brown-800/60 uppercase tracking-widest">Água</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-[9px] font-bold text-brand-brown-800/60 uppercase tracking-widest">Energia</span>
        </div>
      </div>
    </div>
  );
};
