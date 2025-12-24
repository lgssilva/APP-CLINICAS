
import React, { useState } from 'react';
import { useApp } from '../App';
import { Search, Filter, BellRing, User, Hash, Phone, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Alerts: React.FC = () => {
  const { notifications } = useApp(); // Aqui pegamos TODO o histórico
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAlerts = notifications.filter(n => {
    const matchesSearch = 
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.patientNif?.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Buscar histórico por Nome ou NIF..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-sm"
            />
          </div>
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold text-slate-600 text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="success">Sucesso</option>
            <option value="info">Informação</option>
            <option value="warning">Avisos</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length > 0 ? filteredAlerts.map(n => (
          <div key={n.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`p-3 rounded-2xl shrink-0 ${
                n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {n.type === 'success' ? <CheckCircle2 size={24} /> : n.type === 'warning' ? <AlertCircle size={24} /> : <Clock size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-slate-800 break-words">{n.message}</p>
                  <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg font-bold uppercase">{n.date} às {n.time}</span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {n.patientName && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <User size={12} className="text-primary" /> {n.patientName}
                    </span>
                  )}
                  {n.patientNif && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Hash size={12} className="text-slate-400" /> NIF: {n.patientNif}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <BellRing size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">O Histórico de auditoria está vazio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
