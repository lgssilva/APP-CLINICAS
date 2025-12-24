
import React, { useState } from 'react';
import { Search, UserPlus, Phone, Calendar, ChevronDown, Euro, Clock, CheckCircle2, FileText, Save, Smartphone, Edit3, X, User as UserIcon, Mail, History, Filter, Users, CalendarDays, Hash, Eye } from 'lucide-react';
import { useApp } from '../App';
import { Patient } from '../types';

const Patients: React.FC = () => {
  const { patients, selectedDoctorId, setSelectedDoctorId, doctors, addPatient, updatePatient, addNotification, brand } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<{ [key: string]: string }>({});
  const [lastVisitFilter, setLastVisitFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    nif: '',
    phone: '',
    email: '',
    healthPlan: 'Privado',
    doctorId: '',
  });

  const term = brand.type === 'MEDICAL' ? 'Médico' : 'Dentista';

  const parseDate = (dateStr: string) => {
    if (dateStr === 'Hoje') return new Date();
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.nif.includes(searchTerm) ||
                          p.phone.includes(searchTerm);
    
    const matchesDoctor = selectedDoctorId === 'all' || p.doctorId === selectedDoctorId;
    
    let matchesDate = true;
    if (lastVisitFilter !== 'all') {
      const lastVisit = parseDate(p.lastVisit);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24));

      if (lastVisitFilter === 'week') matchesDate = diffDays <= 7;
      else if (lastVisitFilter === 'month') matchesDate = diffDays <= 30;
      else if (lastVisitFilter === 'inactive') matchesDate = diffDays > 180;
    }

    return matchesSearch && matchesDoctor && matchesDate;
  });

  const handleSaveNotes = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      updatePatient({ ...patient, notes: tempNotes[patientId] || '' });
      addNotification(`Notas de ${patient.name} guardadas.`, 'success', patient);
    }
  };

  const handleExpandPatient = (patient: Patient) => {
    if (expandedPatient !== patient.id) {
      setExpandedPatient(patient.id);
      if (!tempNotes[patient.id]) setTempNotes({ ...tempNotes, [patient.id]: patient.notes || '' });
      
      // Regista a visualização atual para auditoria
      const now = new Date();
      const formattedDate = now.toLocaleString('pt-PT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Atualiza o estado global para que a "última visualização" seja persistida
      updatePatient({ ...patient, lastViewedAt: formattedDate });
    } else {
      setExpandedPatient(null);
    }
  };

  const openModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({ ...patient });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        nif: '',
        phone: '',
        email: '',
        healthPlan: 'Privado',
        doctorId: doctors[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de NIF (9 dígitos numéricos)
    const nifValue = formData.nif || '';
    if (nifValue.length !== 9 || isNaN(Number(nifValue))) {
      addNotification("NIF inválido: Deve conter exatamente 9 dígitos.", "warning");
      return;
    }

    if (editingPatient) {
      updatePatient({ ...editingPatient, ...formData } as Patient);
      addNotification(`Dados de ${formData.name} atualizados!`, 'success', formData as Patient);
    } else {
      const newPatient: Patient = {
        id: `P${Math.floor(Math.random() * 900) + 100}`,
        name: formData.name || 'Sem Nome',
        nif: nifValue,
        phone: formData.phone || '',
        email: formData.email || '',
        lastVisit: 'Hoje',
        healthPlan: formData.healthPlan || 'Privado',
        doctorId: formData.doctorId || doctors[0]?.id || '',
        history: [],
        notes: ''
      };
      addPatient(newPatient);
      addNotification(`Paciente ${newPatient.name} registado com NIF ${nifValue}.`, 'success', newPatient);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Nome, NIF ou telemóvel..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 outline-none font-medium text-slate-700 transition-all text-sm"
            />
          </div>
          
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <select 
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 outline-none font-semibold text-slate-600 appearance-none transition-all text-sm"
            >
              <option value="all">Todos os {term}s</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-52">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <select 
              value={lastVisitFilter}
              onChange={(e) => setLastVisitFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 outline-none font-semibold text-slate-600 appearance-none transition-all text-sm"
            >
              <option value="all">Última Visita: Qualquer</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="inactive">Inativos (+6 meses)</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => openModal()}
          className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95 transition-all text-sm whitespace-nowrap shrink-0"
        >
          <UserPlus size={18} /> Novo Paciente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredPatients.length > 0 ? filteredPatients.map(p => (
          <div key={p.id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${expandedPatient === p.id ? 'border-primary shadow-xl' : 'border-slate-100 shadow-sm'}`}>
            <div 
              className="p-5 flex flex-col md:flex-row items-center gap-5 cursor-pointer"
              onClick={() => handleExpandPatient(p)}
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-bold text-xl border border-slate-100 shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md w-fit mx-auto md:mx-0 tracking-tight">ID: {p.id}</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full w-fit mx-auto md:mx-0">
                    <UserIcon size={12} /> {doctors.find(d => d.id === p.doctorId)?.name || term}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <Hash size={14} className="text-slate-400" /> NIF: {p.nif}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Smartphone size={14} className="text-emerald-500" /> {p.phone}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-tight">
                    <Clock size={14} className="text-amber-500" /> Última: {p.lastVisit}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(p); }}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <div className={`p-3 text-slate-300 transition-transform duration-300 ${expandedPatient === p.id ? 'rotate-180' : ''}`}>
                   <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {expandedPatient === p.id && (
              <div className="border-t border-slate-50 bg-slate-50/30 p-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} className="text-primary" /> Notas Clínicas
                    </h5>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <textarea 
                        value={tempNotes[p.id] || ''}
                        onChange={(e) => setTempNotes({ ...tempNotes, [p.id]: e.target.value })}
                        className="w-full h-32 text-sm border-none bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-primary/5 resize-none text-slate-600 font-medium outline-none"
                        placeholder="Adicione observações..."
                      />
                      <button 
                        onClick={() => handleSaveNotes(p.id)}
                        className="w-full mt-3 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
                      >
                        <Save size={14} /> Guardar Notas
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-indigo-500" /> Histórico Recente
                    </h5>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                      {p.history && p.history.length > 0 ? p.history.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{item.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.date}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-900">€{item.value?.toLocaleString('pt-PT')}</p>
                        </div>
                      )) : <p className="text-center text-slate-300 py-6 font-bold text-[10px] uppercase">Sem registos</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Euro size={14} className="text-emerald-500" /> Resumo Financeiro
                    </h5>
                    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg">
                        <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mb-1">Total Liquidado</p>
                        <p className="text-3xl font-bold mb-4 tracking-tighter">
                          € {p.history.filter(h => h.status === 'Pago').reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('pt-PT')}
                        </p>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px]">
                          <span className="opacity-60 font-bold uppercase">Seguradora</span>
                          <span className="font-bold text-emerald-400">{p.healthPlan}</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Seção de auditoria de visualização do perfil */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Eye size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auditoria de Acesso</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">Última visualização da ficha:</span>
                      <span className="text-[10px] font-black text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                        {p.lastViewedAt || 'Primeiro acesso registado'}
                      </span>
                   </div>
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Users size={40} className="mx-auto text-slate-100 mb-3" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum paciente encontrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-primary text-white">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <X size={18} />
              </button>
              <h3 className="text-xl font-bold">{editingPatient ? 'Ficha do Paciente' : 'Novo Cadastro'}</h3>
              <p className="text-white/70 text-xs font-medium">Informações legais e de contacto.</p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nome Completo</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">NIF (Obrigatório)</label>
                  <input required maxLength={9} minLength={9} value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5" placeholder="9 dígitos" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Telemóvel</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Seguradora</label>
                  <input value={formData.healthPlan} onChange={e => setFormData({...formData, healthPlan: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">{term} Responsável</label>
                <select 
                  value={formData.doctorId} 
                  onChange={e => setFormData({...formData, doctorId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5 appearance-none"
                >
                  <option value="">Selecione um profissional</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 transition-all mt-2 active:scale-95">
                Salvar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
