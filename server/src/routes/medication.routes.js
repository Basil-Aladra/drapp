import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all medications
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const medications = await prisma.medication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(medications);
  } catch (error) {
    next(error);
  }
});

// Get medication by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const medication = await prisma.medication.findUnique({
      where: { id: req.params.id },
    });

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    next(error);
  }
});

// Create medication
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, dosageForm, stock } = req.body;

    if (!name || !description || !dosageForm) {
      return res.status(400).json({ error: 'Name, description, and dosage form are required' });
    }

    const medication = await prisma.medication.create({
      data: {
        name,
        description,
        dosageForm,
        stock: stock || null,
      },
    });

    res.status(201).json(medication);
  } catch (error) {
    next(error);
  }
});

// Update medication
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, dosageForm, stock } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (dosageForm) updateData.dosageForm = dosageForm;
    if (stock !== undefined) updateData.stock = stock;

    const medication = await prisma.medication.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(medication);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Medication not found' });
    }
    next(error);
  }
});

// Delete medication
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    await prisma.medication.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Medication not found' });
    }
    next(error);
  }
});

export default router;

