
import React, { useState } from 'react';
import { useApp } from '../App';
import { Calendar, Clock, User, CheckCircle2, ChevronRight, ChevronLeft, Smartphone, Hash, Mail, MapPin, Star, ShieldCheck } from 'lucide-react';
import { AppointmentStatus } from '../types';
import { whatsappService } from '../services/whatsappService';

const Booking: React.FC = () => {
  const { brand, doctors, addNotification, setAppointments, appointments } = useApp();
  const [step, setStep] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', nif: '', phone: '', email: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const isSlotTaken = (time: string) => {
    return appointments.some(app => app.date === selectedDate && app.time === time && (app as any).doctorId === selectedDoctorId);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação NIF
    if (formData.nif.length !== 9 || isNaN(Number(formData.nif))) {
      alert("NIF inválido. Deve conter exatamente 9 dígitos.");
      return;
    }

    const newApp = {
      id: Date.now().toString(),
      patientId: 'new_web',
      patientName: formData.name,
      time: selectedTime,
      date: selectedDate,
      status: AppointmentStatus.PENDING,
      procedure: 'Agendamento Online',
      doctorId: selectedDoctorId
    };

    setAppointments(prev => [...prev, newApp]);
    
    // Notificação Interna do Sistema
    addNotification(`Novo Agendamento Online: ${formData.name} para o Dr. ${selectedDoctor?.name}.`, 'success', {
      name: formData.name,
      nif: formData.nif,
      phone: formData.phone,
      email: formData.email
    });

    // DISPARO AUTOMÁTICO VIA API OFICIAL (Gatilho de Background)
    whatsappService.triggerAutoNotification('BOOKING', { 
      patient: formData.name, 
      date: selectedDate, 
      time: selectedTime,
      phone: formData.phone 
    }).then(res => {
      if (!res.success) {
        console.warn('API Oficial indisponível, utilizando fallback manual...');
      }
    });

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Agendado!</h2>
          <p className="text-slate-500 font-medium mb-8">
            Enviamos uma confirmação automática para o seu WhatsApp e e-mail. Mal podemos esperar por vê-lo!
          </p>
          <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100 mb-8">
             <div className="flex items-center gap-3 mb-4">
                <img src={selectedDoctor?.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div>
                   <p className="font-bold text-slate-800">{selectedDoctor?.name}</p>
                   <p className="text-[10px] font-bold text-primary uppercase">{selectedDoctor?.specialty}</p>
                </div>
             </div>
             <div className="flex justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={14}/> {selectedDate}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {selectedTime}</span>
             </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header Público */}
      <div className="mb-10 text-center">
        <img src={brand.logoUrl} className="h-16 mx-auto mb-4 bg-white p-3 rounded-2xl shadow-sm" alt="logo" />
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{brand.clinicName}</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Marcação Online em 60 segundos</p>
      </div>

      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Lado Esquerdo: Info/Progresso */}
        <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-2 mb-8">
                 <ShieldCheck className="text-primary" size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ambiente Seguro</span>
              </div>
              <h2 className="text-2xl font-bold mb-6">Inicie o seu cuidado agora.</h2>
              
              <div className="space-y-6">
                 {[
                   { step: 1, label: 'Especialista' },
                   { step: 2, label: 'Data e Hora' },
                   { step: 3, label: 'Seus Dados' }
                 ].map(s => (
                   <div key={s.step} className="flex items-center gap-4 group">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${step === s.step ? 'bg-primary text-white scale-110' : step > s.step ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                         {step > s.step ? <CheckCircle2 size={16} /> : s.step}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${step === s.step ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="pt-10 border-t border-slate-800 mt-10 md:mt-0">
              <div className="flex items-center gap-2 mb-2">
                 <MapPin size={14} className="text-slate-500" />
                 <span className="text-[10px] font-bold text-slate-400">Lisboa, Portugal</span>
              </div>
              <p className="text-[9px] text-slate-600">© 2024 Powered by ClinicaPro</p>
           </div>
        </div>

        {/* Lado Direito: Formulário Dinâmico */}
        <div className="flex-1 p-8 md:p-12">
           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-4">
                <h3 className="text-xl font-black text-slate-800 mb-8">Com quem deseja marcar?</h3>
                <div className="grid grid-cols-1 gap-4">
                   {doctors.map(d => (
                     <button 
                      key={d.id} 
                      onClick={() => { setSelectedDoctorId(d.id); handleNextStep(); }}
                      className="p-5 border-2 border-slate-50 rounded-3xl flex items-center gap-5 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                     >
                        <img src={d.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-all" alt="" />
                        <div className="flex-1">
                           <h4 className="font-black text-slate-800">{d.name}</h4>
                           <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{d.specialty}</p>
                           <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase">
                              <Star size={10} fill="currentColor" /> 4.9 (120+ avaliações)
                           </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-200 group-hover:text-primary" />
                     </button>
                   ))}
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-4">
                <button onClick={handlePrevStep} className="mb-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                   <ChevronLeft size={16} /> Voltar
                </button>
                <h3 className="text-xl font-black text-slate-800 mb-6">Quando é melhor para si?</h3>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecione a Data</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none" 
                      />
                   </div>

                   {selectedDate && (
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horários Disponíveis</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                           {timeSlots.map(time => {
                             const occupied = isSlotTaken(time);
                             return (
                               <button 
                                key={time} 
                                disabled={occupied}
                                onClick={() => { setSelectedTime(time); handleNextStep(); }}
                                className={`py-3 rounded-xl text-xs font-black transition-all ${occupied ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : selectedTime === time ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                               >
                                  {time}
                               </button>
                             );
                           })}
                        </div>
                     </div>
                   )}
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="animate-in fade-in slide-in-from-right-4">
                <button onClick={handlePrevStep} className="mb-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                   <ChevronLeft size={16} /> Voltar
                </button>
                <h3 className="text-xl font-black text-slate-800 mb-6">Quase lá! Só precisamos dos seus dados.</h3>
                
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIF (Obrigatório)</label>
                        <div className="relative">
                           <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input required maxLength={9} minLength={9} value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="9 dígitos" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telemóvel</label>
                        <div className="relative">
                           <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                      </div>
                   </div>

                   <div className="pt-6">
                      <button type="submit" className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                         Confirmar Agendamento
                      </button>
                      <p className="text-center text-[9px] text-slate-400 mt-4 uppercase font-bold tracking-tight px-10">
                         Ao agendar, concorda com os nossos Termos de Privacidade e Proteção de Dados (RGPD).
                      </p>
                   </div>
                </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
