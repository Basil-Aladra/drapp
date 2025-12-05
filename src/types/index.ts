export type UserRole = 'admin' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  createdAt: Date;
  shiftRates?: Record<string, number>;
  shiftCounts?: Record<string, number>;
  totalSalary?: number;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  ownerDoctorId?: string;
  totalDebt: number;
  createdAt: Date;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: Date;
  shiftType?: string;
  allergies: boolean;
  allergyDetails?: string;
  chronicDiseases?: string;
  bloodType?: string;
  weight?: number;
  temperature?: number;
  oxygenLevel?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  diagnosis: string;
  medications: PrescriptionMedication[];
  tests?: TestOrder[];
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  createdAt?: Date;
}

export interface TestOrder {
  testName: string;
  result?: string;
}

export interface Medication {
  id: string;
  name: string;
  description: string;
  dosageForm: 'tablet' | 'syrup' | 'injection' | 'cream' | 'drops' | 'capsule' | 'other';
  stock?: number;
  createdAt: Date;
}

export interface PrescriptionMedication {
  medicationId: string;
  medicationName: string;
  quantity: number;
  dosage: string;
  instructions?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalVisits: number;
  totalDebts: number;
  casesPerDoctor: { doctorName: string; cases: number }[];
  recentVisits: Visit[];
  patientsWithDebt: { patient: Patient; debt: number }[];
}
