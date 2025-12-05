import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, Visit, Medication, User } from '@/types';

interface DataContextType {
  patients: Patient[];
  visits: Visit[];
  medications: Medication[];
  doctors: User[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'totalDebt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addVisit: (visit: Omit<Visit, 'id' | 'createdAt'>) => void;
  updateVisit: (id: string, visit: Partial<Visit>) => void;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addDoctor: (doctor: Omit<User, 'id' | 'createdAt'>) => User;
  updateDoctor: (id: string, doctor: Partial<User>) => void;
  deleteDoctor: (id: string) => void;
  getPatientVisits: (patientId: string) => Visit[];
  getPatientDebt: (patientId: string) => number;
  updateDoctorShiftRates: (id: string, rates: Record<string, number>) => void;
  updateDoctorShiftCounts: (id: string, counts: Record<string, number>) => void;
  resetDoctorShiftCounts: (id: string) => void;
  incrementDoctorShiftCount: (id: string, type: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial mock data
const initialPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    dateOfBirth: new Date('1985-03-15'),
    phone: '+1 555 123 4567',
    bloodType: 'A+',
    ownerDoctorId: '2',
    totalDebt: 150,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Maria Garcia',
    dateOfBirth: new Date('1992-07-22'),
    phone: '+1 555 987 6543',
    bloodType: 'O-',
    allergies: 'Penicillin',
    ownerDoctorId: '3',
    totalDebt: 0,
    createdAt: new Date('2024-02-05'),
  },
  {
    id: '3',
    name: 'Robert Johnson',
    dateOfBirth: new Date('1978-11-30'),
    phone: '+1 555 456 7890',
    bloodType: 'B+',
    chronicDiseases: 'Diabetes Type 2',
    ownerDoctorId: '3',
    totalDebt: 320,
    createdAt: new Date('2024-01-20'),
  },
];

const initialMedications: Medication[] = [
  { id: '1', name: 'Amoxicillin 500mg', description: 'Antibiotic for bacterial infections', dosageForm: 'capsule', createdAt: new Date() },
  { id: '2', name: 'Ibuprofen 400mg', description: 'Pain reliever and anti-inflammatory', dosageForm: 'tablet', createdAt: new Date() },
  { id: '3', name: 'Omeprazole 20mg', description: 'Reduces stomach acid production', dosageForm: 'capsule', createdAt: new Date() },
  { id: '4', name: 'Cough Syrup', description: 'For dry and productive cough', dosageForm: 'syrup', createdAt: new Date() },
  { id: '5', name: 'Insulin', description: 'For diabetes management', dosageForm: 'injection', createdAt: new Date() },
];

const initialDoctors: User[] = [
  { id: '2', name: 'Dr. Sarah Johnson', email: 'sarah@clinic.com', role: 'doctor', specialization: 'General Medicine', phone: '+1 234 567 890', createdAt: new Date(), shiftRates: { A: 0, B: 0 }, shiftCounts: { A: 0, B: 0 }, totalSalary: 0 },
  { id: '3', name: 'Dr. Michael Chen', email: 'michael@clinic.com', role: 'doctor', specialization: 'Pediatrics', phone: '+1 234 567 891', createdAt: new Date(), shiftRates: { A: 0, B: 0 }, shiftCounts: { A: 0, B: 0 }, totalSalary: 0 },
  { id: '4', name: 'Dr. Emily Williams', email: 'emily@clinic.com', role: 'doctor', specialization: 'Cardiology', phone: '+1 234 567 892', createdAt: new Date(), shiftRates: { A: 0, B: 0 }, shiftCounts: { A: 0, B: 0 }, totalSalary: 0 },
];

const initialVisits: Visit[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '2',
    date: new Date('2024-11-15'),
    shiftType: 'A',
    allergies: false,
    bloodType: 'A+',
    weight: 75,
    temperature: 37.2,
    oxygenLevel: 98,
    heartRate: 72,
    diagnosis: 'Common cold with mild fever',
    medications: [
      { medicationId: '2', medicationName: 'Ibuprofen 400mg', quantity: 10, dosage: '1 tablet 3x daily' },
      { medicationId: '4', medicationName: 'Cough Syrup', quantity: 1, dosage: '10ml 3x daily' },
    ],
    totalAmount: 200,
    paidAmount: 50,
    isPaid: false,
  },
  {
    id: '2',
    patientId: '3',
    patientName: 'Robert Johnson',
    doctorId: '3',
    date: new Date('2024-11-20'),
    shiftType: 'B',
    allergies: false,
    chronicDiseases: 'Diabetes Type 2',
    bloodType: 'B+',
    weight: 82,
    temperature: 36.8,
    oxygenLevel: 97,
    heartRate: 78,
    diagnosis: 'Routine diabetes checkup',
    medications: [
      { medicationId: '5', medicationName: 'Insulin', quantity: 2, dosage: 'As prescribed' },
    ],
    totalAmount: 320,
    paidAmount: 0,
    isPaid: false,
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [doctors, setDoctors] = useState<User[]>(initialDoctors);

  const calculateTotalSalary = (d: User) => {
    const rates = d.shiftRates || {};
    const counts = d.shiftCounts || {};
    const keys = new Set<string>([...Object.keys(rates), ...Object.keys(counts)]);
    let sum = 0;
    keys.forEach((k) => {
      const r = rates[k] || 0;
      const c = counts[k] || 0;
      sum += r * c;
    });
    return sum;
  };

  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt' | 'totalDebt'>) => {
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      totalDebt: 0,
      createdAt: new Date(),
    };
    setPatients([...patients, newPatient]);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(patients.map(p => p.id === id ? { ...p, ...patientData } : p));
  };

  const deletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const addVisit = (visit: Omit<Visit, 'id' | 'createdAt'>) => {
    const newVisit: Visit = {
      ...visit,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setVisits([...visits, newVisit]);
    
    // Update patient debt
    if (!visit.isPaid) {
      const debt = visit.totalAmount - visit.paidAmount;
      updatePatient(visit.patientId, {
        totalDebt: getPatientDebt(visit.patientId) + debt,
      });
    }

    if (visit.shiftType) {
      incrementDoctorShiftCount(visit.doctorId, visit.shiftType);
    }
  };

  const updateVisit = (id: string, visitData: Partial<Visit>) => {
    setVisits(visits.map(v => v.id === id ? { ...v, ...visitData } : v));
  };

  const addMedication = (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMedications([...medications, newMedication]);
  };

  const updateMedication = (id: string, medicationData: Partial<Medication>) => {
    setMedications(medications.map(m => m.id === id ? { ...m, ...medicationData } : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const addDoctor = (doctor: Omit<User, 'id' | 'createdAt'>): User => {
    const newDoctor: User = {
      ...doctor,
      id: Date.now().toString(),
      createdAt: new Date(),
      shiftRates: doctor.role === 'doctor' ? {} : undefined,
      shiftCounts: doctor.role === 'doctor' ? {} : undefined,
      totalSalary: doctor.role === 'doctor' ? 0 : undefined,
    };
    setDoctors([...doctors, newDoctor]);
    return newDoctor;
  };

  const updateDoctor = (id: string, doctorData: Partial<User>) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, ...doctorData } : d));
  };

  const deleteDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const updateDoctorShiftRates = (id: string, rates: Record<string, number>) => {
    setDoctors(doctors.map(d => {
      if (d.id !== id) return d;
      const next = { ...d, shiftRates: { ...(d.shiftRates || {}), ...rates } };
      next.totalSalary = calculateTotalSalary(next);
      return next;
    }));
  };

  const updateDoctorShiftCounts = (id: string, counts: Record<string, number>) => {
    setDoctors(doctors.map(d => {
      if (d.id !== id) return d;
      const next = { ...d, shiftCounts: { ...(d.shiftCounts || {}), ...counts } };
      next.totalSalary = calculateTotalSalary(next);
      return next;
    }));
  };

  const resetDoctorShiftCounts = (id: string) => {
    setDoctors(doctors.map(d => {
      if (d.id !== id) return d;
      const keys = Object.keys(d.shiftCounts || {});
      const reset: Record<string, number> = {};
      keys.forEach(k => { reset[k] = 0; });
      const next = { ...d, shiftCounts: reset };
      next.totalSalary = calculateTotalSalary(next);
      return next;
    }));
  };

  const incrementDoctorShiftCount = (id: string, type: string) => {
    setDoctors(doctors.map(d => {
      if (d.id !== id) return d;
      const current = d.shiftCounts || {};
      const nextCounts = { ...current, [type]: (current[type] || 0) + 1 };
      const next = { ...d, shiftCounts: nextCounts };
      next.totalSalary = calculateTotalSalary(next);
      return next;
    }));
  };

  const getPatientVisits = (patientId: string) => {
    return visits.filter(v => v.patientId === patientId);
  };

  const getPatientDebt = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.totalDebt || 0;
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        visits,
        medications,
        doctors,
        addPatient,
        updatePatient,
        deletePatient,
        addVisit,
        updateVisit,
        addMedication,
        updateMedication,
        deleteMedication,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        getPatientVisits,
        getPatientDebt,
        updateDoctorShiftRates,
        updateDoctorShiftCounts,
        resetDoctorShiftCounts,
        incrementDoctorShiftCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
