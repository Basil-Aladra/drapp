import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.testOrder.deleteMany();
  await prisma.prescriptionMedication.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clinic.com',
      password: adminPassword,
      name: 'Dr. Admin',
      role: 'admin',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create doctors
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctor1 = await prisma.user.create({
    data: {
      email: 'sarah@clinic.com',
      password: doctorPassword,
      name: 'Dr. Sarah Johnson',
      role: 'doctor',
      specialization: 'General Medicine',
      phone: '+1 234 567 890',
      shiftRates: JSON.stringify({ A: 100, B: 150 }),
      shiftCounts: JSON.stringify({ A: 0, B: 0 }),
      totalSalary: 0,
    },
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: 'michael@clinic.com',
      password: doctorPassword,
      name: 'Dr. Michael Chen',
      role: 'doctor',
      specialization: 'Pediatrics',
      phone: '+1 234 567 891',
      shiftRates: JSON.stringify({ A: 120, B: 170 }),
      shiftCounts: JSON.stringify({ A: 0, B: 0 }),
      totalSalary: 0,
    },
  });

  const doctor3 = await prisma.user.create({
    data: {
      email: 'emily@clinic.com',
      password: doctorPassword,
      name: 'Dr. Emily Williams',
      role: 'doctor',
      specialization: 'Cardiology',
      phone: '+1 234 567 892',
      shiftRates: JSON.stringify({ A: 150, B: 200 }),
      shiftCounts: JSON.stringify({ A: 0, B: 0 }),
      totalSalary: 0,
    },
  });
  console.log('✅ Created doctors');

  // Create medications
  const medications = [
    {
      name: 'Amoxicillin 500mg',
      description: 'Antibiotic for bacterial infections',
      dosageForm: 'capsule',
      stock: 100,
    },
    {
      name: 'Ibuprofen 400mg',
      description: 'Pain reliever and anti-inflammatory',
      dosageForm: 'tablet',
      stock: 200,
    },
    {
      name: 'Omeprazole 20mg',
      description: 'Reduces stomach acid production',
      dosageForm: 'capsule',
      stock: 150,
    },
    {
      name: 'Cough Syrup',
      description: 'For dry and productive cough',
      dosageForm: 'syrup',
      stock: 50,
    },
    {
      name: 'Insulin',
      description: 'For diabetes management',
      dosageForm: 'injection',
      stock: 30,
    },
  ];

  const createdMedications = [];
  for (const med of medications) {
    const medication = await prisma.medication.create({ data: med });
    createdMedications.push(medication);
  }
  console.log('✅ Created medications');

  // Create patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'John Smith',
      dateOfBirth: new Date('1985-03-15'),
      phone: '+1 555 123 4567',
      bloodType: 'A+',
      ownerDoctorId: doctor1.id,
      totalDebt: 150,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Maria Garcia',
      dateOfBirth: new Date('1992-07-22'),
      phone: '+1 555 987 6543',
      bloodType: 'O-',
      allergies: 'Penicillin',
      ownerDoctorId: doctor2.id,
      totalDebt: 0,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      name: 'Robert Johnson',
      dateOfBirth: new Date('1978-11-30'),
      phone: '+1 555 456 7890',
      bloodType: 'B+',
      chronicDiseases: 'Diabetes Type 2',
      ownerDoctorId: doctor3.id,
      totalDebt: 320,
    },
  });
  console.log('✅ Created patients');

  // Create visits
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patient1.id,
      patientName: patient1.name,
      doctorId: doctor1.id,
      date: new Date('2024-11-15'),
      shiftType: 'A',
      allergies: false,
      bloodType: 'A+',
      weight: 75,
      temperature: 37.2,
      oxygenLevel: 98,
      heartRate: 72,
      diagnosis: 'Common cold with mild fever',
      totalAmount: 200,
      paidAmount: 50,
      isPaid: false,
      prescriptions: {
        create: [
          {
            medicationId: createdMedications[1].id,
            medicationName: createdMedications[1].name,
            quantity: 10,
            dosage: '1 tablet 3x daily',
          },
          {
            medicationId: createdMedications[3].id,
            medicationName: createdMedications[3].name,
            quantity: 1,
            dosage: '10ml 3x daily',
          },
        ],
      },
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      patientId: patient3.id,
      patientName: patient3.name,
      doctorId: doctor2.id,
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
      totalAmount: 320,
      paidAmount: 0,
      isPaid: false,
      prescriptions: {
        create: [
          {
            medicationId: createdMedications[4].id,
            medicationName: createdMedications[4].name,
            quantity: 2,
            dosage: 'As prescribed',
          },
        ],
      },
    },
  });
  console.log('✅ Created visits');

  // Update doctor shift counts based on visits
  await prisma.user.update({
    where: { id: doctor1.id },
    data: {
      shiftCounts: JSON.stringify({ A: 1, B: 0 }),
      totalSalary: 100, // 1 * 100
    },
  });

  await prisma.user.update({
    where: { id: doctor2.id },
    data: {
      shiftCounts: JSON.stringify({ A: 0, B: 1 }),
      totalSalary: 170, // 1 * 170
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Admin: admin@clinic.com / admin123');
  console.log('   Doctor: sarah@clinic.com / doctor123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

