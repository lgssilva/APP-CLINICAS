
import React from 'react';
import { LayoutDashboard, Calendar, FileText, HeartPulse, Settings, Users, Stethoscope, BellRing } from 'lucide-react';
import { AppointmentStatus, BrandConfig, Doctor } from './types';

export const BRAND: BrandConfig = {
  clinicName: "OdontoLux Dental Care",
  logoUrl: "https://picsum.photos/seed/clinic/200/200",
  primaryColor: "#2563eb",
  accentColor: "#4f46e5",
  type: 'DENTAL'
};

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { label: 'Médicos', icon: <Stethoscope size={20} />, path: '/doctors' },
  { label: 'Agenda', icon: <Calendar size={20} />, path: '/agenda' },
  { label: 'Orçamentos', icon: <FileText size={20} />, path: '/budgets' },
  { label: 'Alertas', icon: <BellRing size={20} />, path: '/alerts' }, // Nova seção
  { label: 'Pós-Cuidado', icon: <HeartPulse size={20} />, path: '/post-care' },
  { label: 'Pacientes', icon: <Users size={20} />, path: '/patients' },
  { label: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Ricardo M.', specialty: 'Implantologia', registration: 'OMP 12345', avatar: 'https://i.pravatar.cc/150?u=d1' },
  { id: 'd2', name: 'Dra. Sofia Bento', specialty: 'Ortodontia', registration: 'OMP 67890', avatar: 'https://i.pravatar.cc/150?u=d2' },
];

export const MOCK_APPOINTMENTS = [
  { id: '1', patientId: 'p1', patientName: 'Ana Silva', time: '09:00', date: '2024-05-20', status: AppointmentStatus.CONFIRMED, procedure: 'Limpeza Geral' },
];

export const MOCK_WAITLIST = [
  { id: 'w1', name: 'Eduarda Gomes', phone: '(+351) 912 888 777', preferredTime: 'Tarde' },
];
