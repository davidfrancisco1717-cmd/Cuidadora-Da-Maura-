import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, User, Settings, X, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'chat', label: 'Principal', icon: Heart },
    { id: 'history', label: 'Minha Saúde', icon: Calendar },
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-brown-800 rounded-xl flex items-center justify-center shadow-lg shadow-brand-brown-800/20">
            <Heart className="w-5 h-5 text-brand-tan fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-brown-800">Maura IA</span>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-brand-brown-800/40">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                isActive 
                  ? "bg-brand-terracotta text-white shadow-lg shadow-brand-terracotta/20" 
                  : "text-brand-brown-800/60 hover:bg-brand-cream"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-brand-tan" : "group-hover:text-brand-terracotta")} />
              <span className={cn(isActive ? "underline decoration-brand-tan/30 underline-offset-4" : "")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-5 bg-brand-cream rounded-3xl border border-brand-tan/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-brown-800">
            <ShieldCheck className="w-4 h-4 text-brand-terracotta" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Amparo Seguro</span>
          </div>
          <p className="text-[10px] text-brand-brown-800/70 leading-relaxed font-medium">
            Seus dados são protegidos com ética e tecnologia.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 h-screen border-r border-brand-tan/10 bg-white sticky top-0 overflow-hidden">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-brand-brown-800/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[70] shadow-2xl md:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
