
export enum AppointmentStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  WAITLIST = 'WAITLIST'
}

export type ClinicType = 'MEDICAL' | 'DENTAL';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  registration: string;
  avatar: string;
  bio?: string;
  experience?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  date: string;
  status: AppointmentStatus;
  procedure: string;
  value?: number;
}

export interface PatientHistoryItem {
  id: string;
  type: 'ORÇAMENTO' | 'PAGAMENTO' | 'CONSULTA';
  date: string;
  description: string;
  value?: number;
  status: string;
}

export interface Patient {
  id: string;
  name: string;
  nif: string; // Adicionado NIF
  phone: string;
  email?: string;
  lastVisit: string;
  lastViewedAt?: string;
  healthPlan: string;
  doctorId: string;
  notes?: string;
  history: PatientHistoryItem[];
}

export interface BudgetItem {
  description: string;
  price: number;
}

export interface BrandConfig {
  clinicName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  type: ClinicType;
}
