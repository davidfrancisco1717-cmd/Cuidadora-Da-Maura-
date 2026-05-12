import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { HealthLog } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HealthChartsProps {
  logs: HealthLog[];
}

export const HealthCharts: React.FC<HealthChartsProps> = ({ logs }) => {
  const chartData = useMemo(() => {
    // Process logs into daily averages or points
    // For simplicity and immediate feedback, we'll take the last 20 logs and sort them
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    
    // Group by day to show trends
    const dailyData: Record<string, { date: string, timestamp: number, energy?: number, pain?: number }> = {};
    
    sortedLogs.forEach(log => {
      if (log.type === 'hydration') return; // Skip hydration for this line chart
      
      const day = format(new Date(log.timestamp), 'dd/MM');
      if (!dailyData[day]) {
        dailyData[day] = { 
          date: day, 
          timestamp: log.timestamp 
        };
      }
      
      if (log.type === 'energy') {
        dailyData[day].energy = log.value;
      } else if (log.type === 'pain') {
        dailyData[day].pain = log.value;
      }
    });
    
    return Object.values(dailyData).sort((a, b) => a.timestamp - b.timestamp);
  }, [logs]);

  if (chartData.length < 2) {
    return (
      <div className="glass-card p-8 text-center bg-white/40 border-dashed border-2 border-brand-tan/20">
        <p className="text-xs font-bold text-brand-brown-800/40 uppercase tracking-widest">
          Registre mais dados para visualizar suas tendências de saúde.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 bg-white/60 border-2 border-brand-tan/10 shadow-sm">
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-brand-brown-800 uppercase tracking-widest opacity-60">Tendências de Bem-Estar</h3>
        <p className="text-xs text-brand-brown-800/80 mt-1">Sua evolução nos últimos dias</p>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D3B3" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#5C4033', opacity: 0.5 }}
            />
            <YAxis 
              domain={[0, 10]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#5C4033', opacity: 0.5 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFBF5', 
                border: '1px solid #E5D3B3', 
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#5C4033'
              }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              formatter={(value) => (
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-800/60 ml-1">
                  {value === 'energy' ? 'Energia' : 'Dor'}
                </span>
              )}
            />
            <Line 
              type="monotone" 
              dataKey="energy" 
              stroke="#CB5736" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#CB5736', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="energy"
            />
            <Line 
              type="monotone" 
              dataKey="pain" 
              stroke="#5C4033" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#5C4033', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="pain"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
