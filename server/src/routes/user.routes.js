import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all doctors
router.get('/doctors', authenticateToken, async (req, res, next) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'doctor' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true,
        phone: true,
        shiftRates: true,
        shiftCounts: true,
        totalSalary: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(doctors.map(doctor => ({
      ...doctor,
      shiftRates: doctor.shiftRates ? JSON.parse(doctor.shiftRates) : {},
      shiftCounts: doctor.shiftCounts ? JSON.parse(doctor.shiftCounts) : {},
    })));
  } catch (error) {
    next(error);
  }
});

// Get doctor by ID
router.get('/doctors/:id', authenticateToken, async (req, res, next) => {
  try {
    const doctor = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: 'doctor',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true,
        phone: true,
        shiftRates: true,
        shiftCounts: true,
        totalSalary: true,
        createdAt: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      ...doctor,
      shiftRates: doctor.shiftRates ? JSON.parse(doctor.shiftRates) : {},
      shiftCounts: doctor.shiftCounts ? JSON.parse(doctor.shiftCounts) : {},
    });
  } catch (error) {
    next(error);
  }
});

// Update doctor shift rates (admin only)
router.put('/doctors/:id/shift-rates', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { rates } = req.body;

    const doctor = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'doctor' },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const currentRates = doctor.shiftRates ? JSON.parse(doctor.shiftRates) : {};
    const currentCounts = doctor.shiftCounts ? JSON.parse(doctor.shiftCounts) : {};
    const newRates = { ...currentRates, ...rates };

    // Calculate total salary
    let totalSalary = 0;
    Object.keys(newRates).forEach(key => {
      const rate = newRates[key] || 0;
      const count = currentCounts[key] || 0;
      totalSalary += rate * count;
    });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        shiftRates: JSON.stringify(newRates),
        totalSalary,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true,
        phone: true,
        shiftRates: true,
        shiftCounts: true,
        totalSalary: true,
        createdAt: true,
      },
    });

    res.json({
      ...updated,
      shiftRates: JSON.parse(updated.shiftRates),
      shiftCounts: updated.shiftCounts ? JSON.parse(updated.shiftCounts) : {},
    });
  } catch (error) {
    next(error);
  }
});

// Update doctor shift counts (admin only)
router.put('/doctors/:id/shift-counts', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { counts } = req.body;

    const doctor = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'doctor' },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const currentRates = doctor.shiftRates ? JSON.parse(doctor.shiftRates) : {};
    const newCounts = { ...(doctor.shiftCounts ? JSON.parse(doctor.shiftCounts) : {}), ...counts };

    // Calculate total salary
    let totalSalary = 0;
    Object.keys(newCounts).forEach(key => {
      const rate = currentRates[key] || 0;
      const count = newCounts[key] || 0;
      totalSalary += rate * count;
    });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        shiftCounts: JSON.stringify(newCounts),
        totalSalary,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true,
        phone: true,
        shiftRates: true,
        shiftCounts: true,
        totalSalary: true,
        createdAt: true,
      },
    });

    res.json({
      ...updated,
      shiftRates: updated.shiftRates ? JSON.parse(updated.shiftRates) : {},
      shiftCounts: JSON.parse(updated.shiftCounts),
    });
  } catch (error) {
    next(error);
  }
});

// Reset doctor shift counts (admin only)
router.post('/doctors/:id/reset-shifts', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const doctor = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'doctor' },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const currentCounts = doctor.shiftCounts ? JSON.parse(doctor.shiftCounts) : {};
    const resetCounts = {};
    Object.keys(currentCounts).forEach(key => {
      resetCounts[key] = 0;
    });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        shiftCounts: JSON.stringify(resetCounts),
        totalSalary: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true,
        phone: true,
        shiftRates: true,
        shiftCounts: true,
        totalSalary: true,
        createdAt: true,
      },
    });

    res.json({
      ...updated,
      shiftRates: updated.shiftRates ? JSON.parse(updated.shiftRates) : {},
      shiftCounts: JSON.parse(updated.shiftCounts),
    });
  } catch (error) {
    next(error);
  }
});

// Update doctor info (admin only)
router.put('/doctors/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, specialization, phone } = req.body;

    const doctor = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'doctor' },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(specialization !== undefined && { specialization }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true,
        phone: true,
        shiftRates: true,
        shiftCounts: true,
        totalSalary: true,
        createdAt: true,
      },
    });

    res.json({
      ...updated,
      shiftRates: updated.shiftRates ? JSON.parse(updated.shiftRates) : {},
      shiftCounts: updated.shiftCounts ? JSON.parse(updated.shiftCounts) : {},
    });
  } catch (error) {
    next(error);
  }
});

// Delete doctor (admin only)
router.delete('/doctors/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const doctor = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'doctor' },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

