import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all visits
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const visits = await prisma.visit.findMany({
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
      orderBy: { date: 'desc' },
    });

    res.json(visits.map(visit => ({
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
    })));
  } catch (error) {
    next(error);
  }
});

// Get visit by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: req.params.id },
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

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
});

// Create visit
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      date,
      shiftType,
      allergies,
      allergyDetails,
      chronicDiseases,
      bloodType,
      weight,
      temperature,
      oxygenLevel,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      diagnosis,
      medications = [],
      tests = [],
      totalAmount,
      paidAmount,
      isPaid,
    } = req.body;

    if (!patientId || !patientName || !doctorId || !date || !diagnosis) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Create visit with prescriptions and tests
    const visit = await prisma.visit.create({
      data: {
        patientId,
        patientName,
        doctorId,
        date: new Date(date),
        shiftType: shiftType || null,
        allergies: allergies || false,
        allergyDetails: allergyDetails || null,
        chronicDiseases: chronicDiseases || null,
        bloodType: bloodType || null,
        weight: weight || null,
        temperature: temperature || null,
        oxygenLevel: oxygenLevel || null,
        bloodPressureSystolic: bloodPressureSystolic || null,
        bloodPressureDiastolic: bloodPressureDiastolic || null,
        heartRate: heartRate || null,
        diagnosis,
        totalAmount: totalAmount || 0,
        paidAmount: paidAmount || 0,
        isPaid: isPaid || false,
        prescriptions: {
          create: medications.map(med => ({
            medicationId: med.medicationId,
            medicationName: med.medicationName,
            quantity: med.quantity,
            dosage: med.dosage,
            instructions: med.instructions || null,
          })),
        },
        tests: {
          create: tests.map(test => ({
            testName: test.testName,
            result: test.result || null,
          })),
        },
      },
      include: {
        prescriptions: true,
        tests: true,
      },
    });

    // Update patient debt if not paid
    if (!isPaid) {
      const debt = (totalAmount || 0) - (paidAmount || 0);
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });
      
      if (patient) {
        await prisma.patient.update({
          where: { id: patientId },
          data: {
            totalDebt: patient.totalDebt + debt,
          },
        });
      }
    }

    // Update doctor shift count if shift type is provided
    if (shiftType) {
      const doctor = await prisma.user.findUnique({
        where: { id: doctorId },
      });

      if (doctor && doctor.role === 'doctor') {
        const currentCounts = doctor.shiftCounts ? JSON.parse(doctor.shiftCounts) : {};
        const currentRates = doctor.shiftRates ? JSON.parse(doctor.shiftRates) : {};
        const newCounts = { ...currentCounts, [shiftType]: (currentCounts[shiftType] || 0) + 1 };

        // Calculate new salary
        let totalSalary = 0;
        Object.keys(newCounts).forEach(key => {
          const rate = currentRates[key] || 0;
          const count = newCounts[key] || 0;
          totalSalary += rate * count;
        });

        await prisma.user.update({
          where: { id: doctorId },
          data: {
            shiftCounts: JSON.stringify(newCounts),
            totalSalary,
          },
        });
      }
    }

    res.status(201).json({
      ...visit,
      medications: visit.prescriptions.map(p => ({
        medicationId: p.medicationId,
        medicationName: p.medicationName,
        quantity: p.quantity,
        dosage: p.dosage,
        instructions: p.instructions,
      })),
      tests: visit.tests,
    });
  } catch (error) {
    next(error);
  }
});

// Update visit
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const {
      date,
      shiftType,
      allergies,
      allergyDetails,
      chronicDiseases,
      bloodType,
      weight,
      temperature,
      oxygenLevel,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      diagnosis,
      medications,
      tests,
      totalAmount,
      paidAmount,
      isPaid,
    } = req.body;

    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (shiftType !== undefined) updateData.shiftType = shiftType || null;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (allergyDetails !== undefined) updateData.allergyDetails = allergyDetails || null;
    if (chronicDiseases !== undefined) updateData.chronicDiseases = chronicDiseases || null;
    if (bloodType !== undefined) updateData.bloodType = bloodType || null;
    if (weight !== undefined) updateData.weight = weight || null;
    if (temperature !== undefined) updateData.temperature = temperature || null;
    if (oxygenLevel !== undefined) updateData.oxygenLevel = oxygenLevel || null;
    if (bloodPressureSystolic !== undefined) updateData.bloodPressureSystolic = bloodPressureSystolic || null;
    if (bloodPressureDiastolic !== undefined) updateData.bloodPressureDiastolic = bloodPressureDiastolic || null;
    if (heartRate !== undefined) updateData.heartRate = heartRate || null;
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (isPaid !== undefined) updateData.isPaid = isPaid;

    // Get old visit to calculate debt change
    const oldVisit = await prisma.visit.findUnique({
      where: { id: req.params.id },
    });

    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        prescriptions: true,
        tests: true,
      },
    });

    // Update medications if provided
    if (medications) {
      // Delete old prescriptions
      await prisma.prescriptionMedication.deleteMany({
        where: { visitId: req.params.id },
      });

      // Create new prescriptions
      if (medications.length > 0) {
        await prisma.prescriptionMedication.createMany({
          data: medications.map(med => ({
            visitId: req.params.id,
            medicationId: med.medicationId,
            medicationName: med.medicationName,
            quantity: med.quantity,
            dosage: med.dosage,
            instructions: med.instructions || null,
          })),
        });
      }
    }

    // Update tests if provided
    if (tests) {
      // Delete old tests
      await prisma.testOrder.deleteMany({
        where: { visitId: req.params.id },
      });

      // Create new tests
      if (tests.length > 0) {
        await prisma.testOrder.createMany({
          data: tests.map(test => ({
            visitId: req.params.id,
            testName: test.testName,
            result: test.result || null,
          })),
        });
      }
    }

    // Update patient debt if payment status changed
    if (oldVisit && (isPaid !== undefined || totalAmount !== undefined || paidAmount !== undefined)) {
      const oldDebt = oldVisit.isPaid ? 0 : oldVisit.totalAmount - oldVisit.paidAmount;
      const newDebt = visit.isPaid ? 0 : visit.totalAmount - visit.paidAmount;
      const debtChange = newDebt - oldDebt;

      if (debtChange !== 0) {
        const patient = await prisma.patient.findUnique({
          where: { id: visit.patientId },
        });

        if (patient) {
          await prisma.patient.update({
            where: { id: visit.patientId },
            data: {
              totalDebt: Math.max(0, patient.totalDebt + debtChange),
            },
          });
        }
      }
    }

    // Reload visit with updated relations
    const updatedVisit = await prisma.visit.findUnique({
      where: { id: req.params.id },
      include: {
        prescriptions: true,
        tests: true,
      },
    });

    res.json({
      ...updatedVisit,
      medications: updatedVisit.prescriptions.map(p => ({
        medicationId: p.medicationId,
        medicationName: p.medicationName,
        quantity: p.quantity,
        dosage: p.dosage,
        instructions: p.instructions,
      })),
      tests: updatedVisit.tests,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Visit not found' });
    }
    next(error);
  }
});

// Delete visit
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: req.params.id },
    });

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Update patient debt
    if (!visit.isPaid) {
      const debt = visit.totalAmount - visit.paidAmount;
      const patient = await prisma.patient.findUnique({
        where: { id: visit.patientId },
      });

      if (patient) {
        await prisma.patient.update({
          where: { id: visit.patientId },
          data: {
            totalDebt: Math.max(0, patient.totalDebt - debt),
          },
        });
      }
    }

    // Delete visit (cascades to prescriptions and tests)
    await prisma.visit.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Visit not found' });
    }
    next(error);
  }
});

export default router;

