
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { Menu, X, Bell, CheckCircle2, Trash2, Check, Clock, Plus, Sparkles, FileCheck, Euro } from 'lucide-react';
import { useApp, Notification } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [showTicker, setShowTicker] = useState(false);
  const [lastTickerMsg, setLastTickerMsg] = useState<string | null>(null);
  const [tickerCategory, setTickerCategory] = useState<Notification['category']>('GENERAL');
  const [isBudgetPulseActive, setIsBudgetPulseActive] = useState(false);
  
  const { brand, notifications, dismissToast, dismissFromSino, markNotificationsAsRead, setIsAppointmentModalOpen } = useApp();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtros de exibição
  const activeToasts = notifications.filter(n => n.visible);
  const sinoNotifications = notifications.filter(n => !n.dismissedFromSino);
  const unreadCount = sinoNotifications.filter(n => !n.read).length;

  // Monitorização de Orçamentos Aprovados
  useEffect(() => {
    const latestNotif = notifications[0];
    if (latestNotif && !latestNotif.read) {
      setLastTickerMsg(latestNotif.message);
      setTickerCategory(latestNotif.category || 'GENERAL');
      setShowTicker(true);
      
      // Efeito específico para Orçamentos
      if (latestNotif.category === 'BUDGET') {
        setIsBudgetPulseActive(true);
        const pulseTimer = setTimeout(() => setIsBudgetPulseActive(false), 8000);
        return () => clearTimeout(pulseTimer);
      }

      const tickerTimer = setTimeout(() => setShowTicker(false), 5000);
      return () => clearTimeout(tickerTimer);
    }
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifDropdownOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Popups Flutuantes */}
      <div className="fixed top-4 right-4 left-4 md:left-auto z-[250] flex flex-col gap-2 pointer-events-none">
        {activeToasts.map(n => (
          <div 
            key={n.id} 
            className={`bg-white border-l-4 ${n.type === 'success' ? 'border-emerald-500' : n.type === 'warning' ? 'border-amber-500' : 'border-blue-500'} shadow-2xl p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 pointer-events-auto max-w-sm ml-auto`}
          >
            <div className={`${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'} p-2 rounded-full shrink-0`}>
              {n.category === 'BUDGET' ? <Euro size={18} /> : n.type === 'warning' ? <Clock size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{n.message}</p>
            </div>
            <button onClick={() => dismissToast(n.id)} className="text-slate-300 hover:text-slate-500 shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <aside className={`hidden md:flex ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-white border-r border-slate-200 flex-col z-50`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={brand.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
            {isSidebarOpen && <span className="font-bold text-slate-800 truncate tracking-tight">{brand.clinicName}</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className={isActive ? 'text-white' : 'text-primary'}>{item.icon}</span>
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><Menu size={24} /></button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-semibold text-slate-800 leading-none">
                {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Painel'}
              </h1>
              
              <div className="h-4 mt-1 overflow-hidden relative">
                {showTicker && lastTickerMsg && (
                  <Link 
                    to="/alerts" 
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight animate-in slide-in-from-bottom-2 duration-500 hover:opacity-80 transition-all ${tickerCategory === 'BUDGET' ? 'text-emerald-600' : 'text-primary'}`}
                  >
                    {tickerCategory === 'BUDGET' ? <Euro size={10} className="shrink-0" /> : <Sparkles size={10} className="shrink-0" />}
                    <span className="truncate max-w-[150px] md:max-w-xs">{lastTickerMsg}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 relative">
            {/* NOVO: INDICADOR DE ORÇAMENTO APROVADO */}
            <Link 
              to="/alerts" 
              className={`p-2.5 rounded-full transition-all relative ${isBudgetPulseActive ? 'bg-emerald-50 text-emerald-600 scale-110' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-400'}`}
              title="Orçamentos Aprovados"
            >
              <FileCheck size={20} className={isBudgetPulseActive ? 'animate-bounce' : ''} />
              {isBudgetPulseActive && <span className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-25"></span>}
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)} 
                className={`p-2.5 text-slate-400 hover:text-primary transition-all relative rounded-full hover:bg-slate-100 ${isNotifDropdownOpen ? 'bg-slate-100 text-primary' : ''}`}
              >
                <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="fixed left-4 right-4 top-16 md:absolute md:left-auto md:right-0 md:top-full md:mt-3 w-auto md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 origin-top-right z-50">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Feed de Eventos</span>
                    <button onClick={markNotificationsAsRead} className="p-1.5 text-slate-400 hover:text-emerald-500" title="Marcar como lidas"><Check size={14} /></button>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto no-scrollbar">
                    {sinoNotifications.length > 0 ? sinoNotifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                        <div className={`mt-1 p-2 rounded-xl h-fit shrink-0 ${!n.read ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                           {n.category === 'BUDGET' ? <Euro size={12} /> : <Clock size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug break-words ${!n.read ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 block">{n.time}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); dismissFromSino(n.id); }}
                          className="p-1.5 h-fit text-slate-200 hover:text-rose-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )) : (
                      <div className="p-10 text-center">
                        <Bell size={32} className="mx-auto text-slate-100 mb-2" />
                        <p className="text-xs font-bold text-slate-300 uppercase">Vazio</p>
                      </div>
                    )}
                  </div>
                  <Link to="/alerts" className="block p-3 bg-slate-50 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">Ver Histórico de Auditoria</Link>
                </div>
              )}
            </div>
            
            <button onClick={() => setIsAppointmentModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95 transition-all flex items-center gap-2">
              <Plus size={18} />
              <span className="hidden sm:inline">Consulta</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
