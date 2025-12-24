
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserPlus, Mail, Phone, ExternalLink, Award, Users, CheckCircle2, Trash2, Edit3, X, Briefcase, Stethoscope, FileText, Star, ShieldCheck, Smartphone } from 'lucide-react';
import { Doctor } from '../types';

const Doctors: React.FC = () => {
  const { doctors, addDoctor, updateDoctor, removeDoctor, selectedDoctorId, setSelectedDoctorId, addNotification, brand } = useApp();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialty: '',
    registration: '',
    avatar: '',
    bio: '',
    experience: ''
  });

  const term = brand.type === 'MEDICAL' ? 'Médico' : 'Dentista';
  const registrationTerm = brand.type === 'MEDICAL' ? 'Cédula OMP' : 'Cédula OMD';

  const handleSelectDoctor = (id: string, name: string) => {
    setSelectedDoctorId(id);
    addNotification(`Painel do ${term} ${name} ativado.`, 'success');
  };

  const openEditModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ ...doctor });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        specialty: '',
        registration: '',
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
        bio: '',
        experience: ''
      });
    }
    setIsEditModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      updateDoctor({ ...editingDoctor, ...formData } as Doctor);
      addNotification(`${term} atualizado com sucesso!`, 'success');
    } else {
      const newDoctor: Doctor = {
        id: `d${Math.floor(Math.random() * 900) + 100}`,
        name: formData.name || `Novo ${term}`,
        specialty: formData.specialty || 'Clínica Geral',
        registration: formData.registration || 'Pendente',
        avatar: formData.avatar || 'https://i.pravatar.cc/150',
        bio: formData.bio || '',
        experience: formData.experience || ''
      };
      addDoctor(newDoctor);
      addNotification(`${term} adicionado à equipa!`, 'success');
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteDoctor = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente remover o ${term} ${name}?`)) {
      removeDoctor(id);
      addNotification(`${term} removido.`, 'warning');
    }
  };

  const openProfile = (doctor: Doctor) => {
    setViewingDoctor(doctor);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Equipa de {term}s</h2>
          <p className="text-sm text-slate-500 font-medium">Gestão de profissionais ativos.</p>
        </div>
        <button 
          onClick={() => openEditModal()}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-sm"
        >
          <UserPlus size={18} /> Adicionar {term}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doctor => (
          <div 
            key={doctor.id} 
            className={`group relative bg-white p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedDoctorId === doctor.id 
                ? 'border-primary shadow-xl ring-4 ring-primary/5' 
                : 'border-transparent shadow-sm hover:border-slate-200 hover:shadow-md'
            }`}
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); openEditModal(doctor); }}
                className="p-2 bg-white shadow-sm text-slate-400 hover:text-primary rounded-xl border border-slate-100"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteDoctor(doctor.id, doctor.name); }}
                className="p-2 bg-white shadow-sm text-slate-400 hover:text-rose-500 rounded-xl border border-slate-100"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="relative flex flex-col items-center text-center" onClick={() => handleSelectDoctor(doctor.id, doctor.name)}>
              <div className="relative mb-4">
                <img 
                  src={doctor.avatar} 
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white transition-transform duration-300 group-hover:scale-105" 
                  alt={doctor.name} 
                />
                {selectedDoctorId === doctor.id && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white shadow-md">
                    <CheckCircle2 size={14} />
                  </div>
                )}
              </div>

              <h4 className="font-bold text-slate-800 text-lg mb-1">{doctor.name}</h4>
              <div className="flex flex-col items-center gap-1.5 mb-5">
                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {doctor.specialty}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{registrationTerm}: {doctor.registration}</span>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Consultas</p>
                  <div className="flex items-center justify-center gap-1 text-slate-700 font-bold text-sm">
                    <Users size={14} className="text-primary" /> 142
                  </div>
                </div>
                <div className="text-center border-l border-slate-50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Avaliação</p>
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-sm">
                    <Award size={14} /> 4.9
                  </div>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2">
                <div className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  selectedDoctorId === doctor.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}>
                  {selectedDoctorId === doctor.id ? 'Painel Ativo' : 'Selecionar'}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); openProfile(doctor); }}
                  className="w-full py-2 text-[9px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
                >
                  Perfil Clínico <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{editingDoctor ? 'Editar Profissional' : `Novo ${term}`}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Registo do Corpo Clínico</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Especialidade</label>
                  <input required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">{registrationTerm}</label>
                <input required value={formData.registration} onChange={e => setFormData({...formData, registration: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-primary/5" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Resumo Biográfico</label>
                <textarea 
                  rows={3} 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Destaque a formação..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-medium outline-none resize-none focus:ring-2 focus:ring-primary/5"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 transition-all mt-2">
                Guardar Dados do {term}
              </button>
            </form>
          </div>
        </div>
      )}

      {isProfileModalOpen && viewingDoctor && (
        <div className="fixed inset-0 z-[120] flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl h-full shadow-2xl relative overflow-hidden animate-in slide-in-from-right duration-400 flex flex-col">
            <div className="relative h-64 shrink-0">
               <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-slate-900/95"></div>
                  <img src={viewingDoctor.avatar} className="w-full h-full object-cover blur-xl opacity-40" alt="" />
               </div>
               <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all z-20"
               >
                 <X size={24} />
               </button>
               
               <div className="absolute bottom-[-30px] left-12 flex items-end gap-6 z-10">
                 <img src={viewingDoctor.avatar} className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover" alt="" />
                 <div className="pb-12">
                   <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">{viewingDoctor.name}</h3>
                   <span className="px-3 py-1 bg-primary text-white text-[9px] font-bold uppercase rounded-lg shadow-md">
                    {viewingDoctor.specialty}
                   </span>
                 </div>
               </div>
            </div>

            <div className="flex-1 mt-12 p-10 overflow-y-auto no-scrollbar space-y-10">
              <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Pontuação</p>
                    <p className="text-base font-bold text-slate-800 flex items-center justify-center gap-1">4.9 <Star size={14} className="text-amber-400 fill-amber-400" /></p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Carreira</p>
                    <p className="text-base font-bold text-slate-800">12 Anos</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Estado</p>
                    <p className="text-base font-bold text-emerald-500 flex items-center justify-center gap-1">Ativo <ShieldCheck size={14} /></p>
                 </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Bio Clínico
                </h5>
                <p className="text-slate-600 leading-relaxed font-medium text-base">
                  {viewingDoctor.bio || "Biografia ainda não disponibilizada."}
                </p>
              </div>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Smartphone size={20} /></div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Telemóvel Interno</p>
                    <p className="text-sm font-bold text-slate-800">+351 912 345 678</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    handleSelectDoctor(viewingDoctor.id, viewingDoctor.name);
                    setIsProfileModalOpen(false);
                  }}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Selecionar Agenda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
