import React, { useState } from 'react';
import { MauraProfile, HealthLog } from '../../types';
import { generateHealthSummary } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { FileText, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface SummaryProps {
  logs: HealthLog[];
  profile: MauraProfile;
}

export const HealthSummary: React.FC<SummaryProps> = ({ logs, profile }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateHealthSummary(logs, profile);
      setSummary(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 bg-brand-cream/30 border-2 border-brand-tan/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-brown-800 rounded-xl flex items-center justify-center shadow-lg shadow-brand-brown-800/10">
            <FileText className="w-5 h-5 text-brand-tan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-brown-800 uppercase tracking-widest">Resumo de Saúde</h3>
            <p className="text-[10px] text-brand-brown-800/50 font-bold uppercase tracking-tight">Relatório Semanal Personalizado</p>
          </div>
        </div>
        {!summary && !loading && (
          <button 
            onClick={handleGenerate}
            className="px-4 py-2 bg-brand-brown-800 text-brand-tan text-[10px] font-bold rounded-xl hover:bg-brand-brown-900 transition-all flex items-center gap-2"
          >
            GERAR AGORA
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 flex flex-col items-center justify-center gap-4 text-brand-brown-800/40"
          >
            <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
            <p className="text-xs font-bold uppercase tracking-tighter">Analisando seus dados com carinho...</p>
          </motion.div>
        ) : summary ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="markdown-body prose prose-sm prose-slate max-w-none text-brand-brown-800/80 leading-relaxed bg-white/60 p-6 rounded-2xl border border-brand-tan/10 shadow-inner">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
            <button 
              onClick={() => setSummary(null)}
              className="mt-4 text-[10px] font-bold text-brand-terracotta uppercase tracking-widest hover:underline"
            >
              Recriar relatório
            </button>
          </motion.div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-brand-tan/20 rounded-2xl">
            <Sparkles className="w-6 h-6 text-brand-tan mx-auto mb-2 opacity-40" />
            <p className="text-[10px] text-brand-brown-800/40 font-bold uppercase tracking-widest">Seus dados registrados aparecerão aqui resumidos pela IA.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
