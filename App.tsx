
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Budgets from './pages/Budgets';
import PostCare from './pages/PostCare';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import Alerts from './pages/Alerts';
import Booking from './pages/Booking'; 
import { BRAND as INITIAL_BRAND, MOCK_DOCTORS, MOCK_APPOINTMENTS as INITIAL_APPOINTMENTS } from './constants';
import { BrandConfig, Doctor, Patient, AppointmentStatus, Appointment } from './types';
import { whatsappService } from './services/whatsappService';
import { X, User, ClipboardList, Search, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface Notification {
  id: number;
  message: string;
  time: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
  category?: 'GENERAL' | 'BUDGET' | 'APPOINTMENT' | 'PATIENT'; // Nova categoria
  visible: boolean; 
  dismissedFromSino: boolean; 
  patientName?: string;
  patientNif?: string;
  patientEmail?: string;
  patientPhone?: string;
}

interface AppContextType {
  brand: BrandConfig;
  setBrand: (b: BrandConfig) => void;
  notifications: Notification[];
  addNotification: (msg: string, type?: 'info' | 'success' | 'warning', patientData?: Partial<Patient>, category?: Notification['category']) => void;
  dismissToast: (id: number) => void;
  dismissFromSino: (id: number) => void;
  markNotificationsAsRead: () => void;
  doctors: Doctor[];
  addDoctor: (d: Doctor) => void;
  updateDoctor: (d: Doctor) => void;
  removeDoctor: (id: string) => void;
  selectedDoctorId: string;
  setSelectedDoctorId: (id: string) => void;
  patients: Patient[];
  addPatient: (p: Patient) => void;
  updatePatient: (p: Patient) => void;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  isAppointmentModalOpen: boolean;
  setIsAppointmentModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [brand, setBrand] = useState<BrandConfig>({ ...INITIAL_BRAND, type: 'DENTAL' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const [patients, setPatients] = useState<Patient[]>([
    { 
      id: 'P001', 
      name: 'Ana Silva', 
      nif: '254888999',
      phone: '912345678', 
      email: 'ana.silva@email.com',
      lastVisit: '18/05/2024', 
      healthPlan: 'Médis', 
      doctorId: 'd1',
      notes: 'Paciente com sensibilidade dentária.',
      history: [{ id: 'h1', type: 'ORÇAMENTO', date: '18/05/2024', description: 'Limpeza e Polimento', value: 60, status: 'Pago' }]
    }
  ]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', brand.primaryColor);
  }, [brand]);

  const addNotification = (
    message: string, 
    type: 'info' | 'success' | 'warning' = 'info', 
    patientData?: Partial<Patient>,
    category: Notification['category'] = 'GENERAL'
  ) => {
    const id = Date.now();
    const now = new Date();
    
    const newNotif: Notification = { 
      id, message, read: false, type, category, visible: true, dismissedFromSino: false,
      time: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
      patientName: patientData?.name,
      patientNif: patientData?.nif,
      patientEmail: patientData?.email,
      patientPhone: patientData?.phone
    };

    setNotifications(prev => [newNotif, ...prev]);

    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, visible: false } : n));
  };

  const dismissFromSino = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissedFromSino: true, visible: false } : n));
  };

  const markNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  
  const addPatient = (p: Patient) => setPatients(prev => [p, ...prev]);
  const updatePatient = (updated: Patient) => setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
  const addDoctor = (d: Doctor) => setDoctors(prev => [...prev, d]);
  const updateDoctor = (updated: Doctor) => setDoctors(prev => prev.map(d => d.id === updated.id ? updated : d));
  const removeDoctor = (id: string) => setDoctors(prev => prev.filter(d => d.id !== id));

  const [formData, setFormData] = useState({
    patientId: '', patientName: '', time: '09:00', date: new Date().toISOString().split('T')[0], doctorId: '', items: [{ description: '', price: 0 }]
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(formData.patientName.toLowerCase()) || p.phone.includes(formData.patientName)
  ).slice(0, 5);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDoctorId = formData.doctorId || (selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0]?.id);
    const doctor = doctors.find(d => d.id === assignedDoctorId);
    
    const isSlotOccupied = appointments.some(app => 
      app.date === formData.date && app.time === formData.time && (app as any).doctorId === assignedDoctorId
    );

    if (isSlotOccupied) {
      addNotification(`Atenção: Horário indisponível para o Dr. ${doctor?.name}.`, 'warning', undefined, 'APPOINTMENT');
      return;
    }

    const newApp: Appointment = {
      id: Date.now().toString(),
      patientId: formData.patientId || 'new',
      patientName: formData.patientName,
      time: formData.time,
      date: formData.date,
      status: AppointmentStatus.PENDING,
      procedure: formData.items[0]?.description || 'Consulta',
      value: formData.items.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
    };

    (newApp as any).doctorId = assignedDoctorId;
    setAppointments(prev => [...prev, newApp].sort((a, b) => a.time.localeCompare(b.time)));
    setIsAppointmentModalOpen(false);
    
    const patientObj = patients.find(p => p.id === formData.patientId);
    addNotification(`Vaga confirmada para ${formData.patientName}.`, 'success', patientObj, 'APPOINTMENT');
    
    setFormData({ patientId: '', patientName: '', time: '09:00', date: new Date().toISOString().split('T')[0], doctorId: '', items: [{ description: '', price: 0 }] });
  };

  const selectPatient = (p: Patient) => {
    setFormData({ ...formData, patientName: p.name, patientId: p.id, doctorId: p.doctorId });
    setShowPatientSuggestions(false);
  };

  return (
    <AppContext.Provider value={{ 
      brand, setBrand, notifications, addNotification, dismissToast, dismissFromSino,
      markNotificationsAsRead, 
      doctors, addDoctor, updateDoctor, removeDoctor,
      selectedDoctorId, setSelectedDoctorId, patients, addPatient, updatePatient,
      appointments, setAppointments, isAppointmentModalOpen, setIsAppointmentModalOpen
    }}>
      <Router>
        <Routes>
          <Route path="/booking" element={<Booking />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/post-care" element={<PostCare />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>

      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAppointmentModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-primary text-white">
              <button onClick={() => setIsAppointmentModalOpen(false)} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><ClipboardList size={22} /></div>
                <h3 className="text-xl font-bold">Reserva de Agenda</h3>
              </div>
            </div>
            
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div className="space-y-1 relative" ref={suggestionRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</label>
                <input 
                  required autoComplete="off"
                  value={formData.patientName} 
                  onChange={e => { setFormData({...formData, patientName: e.target.value, patientId: ''}); setShowPatientSuggestions(true); }} 
                  onFocus={() => setShowPatientSuggestions(true)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-semibold text-sm" 
                />
                {showPatientSuggestions && (formData.patientName.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {filteredPatients.map(p => (
                      <div key={p.id} onClick={() => selectPatient(p)} className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                        <p className="text-xs font-bold text-slate-700">{p.name}</p>
                        <ChevronRight size={14} className="text-slate-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none" />
                <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none" />
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all">
                Confirmar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export default App;
