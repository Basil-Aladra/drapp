import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    // Total patients
    const totalPatients = await prisma.patient.count();

    // Total visits
    const totalVisits = await prisma.visit.count();

    // Total debts
    const patientsWithDebt = await prisma.patient.findMany({
      where: {
        totalDebt: {
          gt: 0,
        },
      },
      orderBy: {
        totalDebt: 'desc',
      },
      take: 10,
    });

    const totalDebts = patientsWithDebt.reduce((sum, patient) => sum + patient.totalDebt, 0);

    // Cases per doctor
    const visitsPerDoctor = await prisma.visit.groupBy({
      by: ['doctorId'],
      _count: {
        id: true,
      },
    });

    const casesPerDoctor = await Promise.all(
      visitsPerDoctor.map(async (item) => {
        const doctor = await prisma.user.findUnique({
          where: { id: item.doctorId },
          select: { name: true },
        });
        return {
          doctorName: doctor?.name || 'Unknown',
          cases: item._count.id,
        };
      })
    );

    // Recent visits
    const recentVisits = await prisma.visit.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        prescriptions: true,
        tests: true,
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedRecentVisits = recentVisits.map(visit => ({
      id: visit.id,
      patientId: visit.patientId,
      patientName: visit.patientName,
      doctorId: visit.doctorId,
      date: visit.date,
      shiftType: visit.shiftType,
      allergies: visit.allergies,
      allergyDetails: visit.allergyDetails,
      chronicDiseases: visit.chronicDiseases,
      bloodType: visit.bloodType,
      weight: visit.weight,
      temperature: visit.temperature,
      oxygenLevel: visit.oxygenLevel,
      bloodPressureSystolic: visit.bloodPressureSystolic,
      bloodPressureDiastolic: visit.bloodPressureDiastolic,
      heartRate: visit.heartRate,
      diagnosis: visit.diagnosis,
      medications: visit.prescriptions.map(p => ({
        medicationId: p.medicationId,
        medicationName: p.medicationName,
        quantity: p.quantity,
        dosage: p.dosage,
        instructions: p.instructions,
      })),
      tests: visit.tests,
      totalAmount: visit.totalAmount,
      paidAmount: visit.paidAmount,
      isPaid: visit.isPaid,
      createdAt: visit.createdAt,
    }));

    // Patients with debt
    const patientsWithDebtFormatted = patientsWithDebt.map(patient => ({
      patient: {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        address: patient.address,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        chronicDiseases: patient.chronicDiseases,
        ownerDoctorId: patient.ownerDoctorId,
        totalDebt: patient.totalDebt,
        createdAt: patient.createdAt,
      },
      debt: patient.totalDebt,
    }));

    res.json({
      totalPatients,
      totalVisits,
      totalDebts,
      casesPerDoctor,
      recentVisits: formattedRecentVisits,
      patientsWithDebt: patientsWithDebtFormatted,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

