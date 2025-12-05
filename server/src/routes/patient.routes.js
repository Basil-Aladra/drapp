import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        ownerDoctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(patients.map(patient => ({
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
    })));
  } catch (error) {
    next(error);
  }
});

// Get patient by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        ownerDoctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
});

// Create patient
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      dateOfBirth,
      phone,
      address,
      bloodType,
      allergies,
      chronicDiseases,
      ownerDoctorId,
    } = req.body;

    if (!name || !dateOfBirth) {
      return res.status(400).json({ error: 'Name and date of birth are required' });
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        phone: phone || null,
        address: address || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        chronicDiseases: chronicDiseases || null,
        ownerDoctorId: ownerDoctorId || null,
        totalDebt: 0,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      dateOfBirth,
      phone,
      address,
      bloodType,
      allergies,
      chronicDiseases,
      ownerDoctorId,
      totalDebt,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (bloodType !== undefined) updateData.bloodType = bloodType || null;
    if (allergies !== undefined) updateData.allergies = allergies || null;
    if (chronicDiseases !== undefined) updateData.chronicDiseases = chronicDiseases || null;
    if (ownerDoctorId !== undefined) updateData.ownerDoctorId = ownerDoctorId || null;
    if (totalDebt !== undefined) updateData.totalDebt = totalDebt;

    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(patient);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    next(error);
  }
});

// Delete patient
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    await prisma.patient.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    next(error);
  }
});

// Get patient visits
router.get('/:id/visits', authenticateToken, async (req, res, next) => {
  try {
    const visits = await prisma.visit.findMany({
      where: { patientId: req.params.id },
      include: {
        prescriptions: true,
        tests: true,
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
      ...visit,
      medications: visit.prescriptions.map(p => ({
        medicationId: p.medicationId,
        medicationName: p.medicationName,
        quantity: p.quantity,
        dosage: p.dosage,
        instructions: p.instructions,
      })),
      tests: visit.tests,
    })));
  } catch (error) {
    next(error);
  }
});

export default router;

