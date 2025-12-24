
import React, { useState } from 'react';
import { MOCK_WAITLIST } from '../constants';
import { AppointmentStatus } from '../types';
import { MessageSquare, Check, X, UserPlus, Smartphone, Clock, Euro, MessageCircle } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { useApp } from '../App';

const Agenda: React.FC = () => {
  const { brand, addNotification, appointments, setAppointments, setIsAppointmentModalOpen } = useApp();
  const [waitlist, setWaitlist] = useState(MOCK_WAITLIST);
  const [isSimulatingWhatsApp, setIsSimulatingWhatsApp] = useState(false);

  const updateStatus = (id: string, newStatus: AppointmentStatus, patientName: string) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    
    if (newStatus === AppointmentStatus.CONFIRMED) {
      addNotification(`Consulta de ${patientName} confirmada com sucesso.`, 'success');
    } else if (newStatus === AppointmentStatus.CANCELED) {
      addNotification(`Consulta de ${patientName} cancelada. Horário agora disponível.`, 'warning');
    }
  };

  const fillSlotFromWaitlist = (slotId: string) => {
    if (waitlist.length === 0) {
      addNotification("A lista de espera está vazia.", "info");
      return;
    }
    const nextPatient = waitlist[0];
    const targetSlot = appointments.find(a => a.id === slotId);
    
    if (targetSlot) {
      const newApp = {
        ...targetSlot,
        patientName: nextPatient.name,
        status: AppointmentStatus.CONFIRMED,
        procedure: 'Urgência (Lista de Espera)',
        value: 0
      };
      setAppointments(prev => prev.map(a => a.id === slotId ? newApp : a));
      setWaitlist(prev => prev.slice(1));
      addNotification(`Vaga preenchida! ${nextPatient.name} agendado para as ${targetSlot.time}.`, 'success');
    }
  };

  const handleWhatsAppReminder = (patientName: string, phone: string, procedure: string, date: string, time: string) => {
    const message = whatsappService.generateConfirmationMsg(patientName, procedure, date, time);
    whatsappService.sendManual(phone, message);
    addNotification(`A abrir WhatsApp para ${patientName}...`, 'info');
  };

  const simulateBulkWhatsApp = () => {
    setIsSimulatingWhatsApp(true);
    addNotification("A disparar lembretes inteligentes para todos os pendentes...", "info");
    
    setTimeout(() => {
      const pendingCount = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;
      setAppointments(prev => prev.map(app => 
        app.status === AppointmentStatus.PENDING ? { ...app, status: AppointmentStatus.CONFIRMED } : app
      ));
      
      addNotification(`${pendingCount} consultas confirmadas automaticamente via IA.`, 'success');
      setIsSimulatingWhatsApp(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
      <div className="lg:col-span-3 space-y-4 md:space-y-6">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Agenda de Hoje</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={simulateBulkWhatsApp}
                disabled={isSimulatingWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-black hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <MessageSquare size={18} />
                {isSimulatingWhatsApp ? 'A disparar...' : 'Confirmar Tudo (IA)'}
              </button>
              <button 
                onClick={() => setIsAppointmentModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/10 md:hidden"
              >
                Nova Consulta
              </button>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente & Procedimentos</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Est.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4"><span className="font-black text-slate-800 text-lg">{app.time}</span></td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm font-black text-slate-700">{app.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{app.procedure}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-600">€{app.value?.toLocaleString('pt-PT')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
                        app.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-100 text-emerald-700' :
                        app.status === AppointmentStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {app.status === AppointmentStatus.CONFIRMED ? 'Confirmado' : app.status === AppointmentStatus.PENDING ? 'Pendente' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                        {app.status === AppointmentStatus.CANCELED ? (
                          <button 
                            onClick={() => fillSlotFromWaitlist(app.id)} 
                            className="px-4 py-1.5 bg-primary text-white font-black text-[10px] rounded-xl uppercase shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                          >
                            Preencher com Espera
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleWhatsAppReminder(app.patientName, "912345678", app.procedure, app.date, app.time)} 
                              className="p-2.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all" 
                              title="Enviar lembrete WhatsApp"
                            >
                              <MessageCircle size={18} />
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, AppointmentStatus.CONFIRMED, app.patientName)} 
                              className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all" 
                              title="Confirmar Presença"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, AppointmentStatus.CANCELED, app.patientName)} 
                              className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                              title="Cancelar Horário"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {appointments.map((app) => (
              <div key={app.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-slate-100 p-2 rounded-xl h-fit"><Clock size={16} className="text-slate-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800">{app.time}</p>
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2 rounded-md">€{app.value}</span>
                      </div>
                      <p className="text-sm font-black text-slate-600">{app.patientName}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black truncate">{app.procedure}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${app.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-100 text-emerald-700' : app.status === AppointmentStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{app.status}</span>
                </div>
                <div className="flex gap-2">
                  {app.status === AppointmentStatus.CANCELED ? (
                    <button onClick={() => fillSlotFromWaitlist(app.id)} className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 tracking-tight uppercase shadow-lg shadow-primary/20">
                      <UserPlus size={14} /> Chamar da Espera
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleWhatsAppReminder(app.patientName, "912345678", app.procedure, app.date, app.time)} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black flex items-center justify-center gap-2">
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                      <button onClick={() => updateStatus(app.id, AppointmentStatus.CONFIRMED, app.patientName)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black flex items-center justify-center gap-2">
                        <Check size={14} /> Confirmar
                      </button>
                      <button onClick={() => updateStatus(app.id, AppointmentStatus.CANCELED, app.patientName)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><X size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center justify-between text-sm uppercase tracking-tight">
            Lista de Espera
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-bold">{waitlist.length}</span>
          </h3>
          <div className="space-y-3">
            {waitlist.length > 0 ? waitlist.map(p => (
              <div key={p.id} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/50 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                <div>
                  <p className="text-sm font-black text-slate-700">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{p.preferredTime}</p>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors">
                     <UserPlus size={18} />
                   </button>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sem pacientes em espera</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
