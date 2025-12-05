const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = { patients: [], visits: [], medications: [], doctors: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load DB file', err);
    return { patients: [], visits: [], medications: [], doctors: [] };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to save DB file', err);
  }
}

let DB = loadDB();

function nowISO() {
  return new Date().toISOString();
}

// Patients
app.get('/api/patients', (req, res) => {
  res.json(DB.patients.map(p => ({ ...p })));
});

app.post('/api/patients', (req, res) => {
  const p = req.body;
  const id = p.id || Date.now().toString();
  const patient = {
    id,
    name: p.name || '',
    dateOfBirth: p.dateOfBirth || null,
    phone: p.phone || null,
    address: p.address || null,
    bloodType: p.bloodType || null,
    allergies: p.allergies || null,
    chronicDiseases: p.chronicDiseases || null,
    ownerDoctorId: p.ownerDoctorId || null,
    totalDebt: p.totalDebt || 0,
    createdAt: nowISO(),
  };
  DB.patients.push(patient);
  saveDB(DB);
  res.json(patient);
});

// Visits
app.get('/api/visits', (req, res) => {
  res.json(DB.visits.map(v => ({ ...v })));
});

app.post('/api/visits', (req, res) => {
  const v = req.body;
  const id = v.id || Date.now().toString();
  const visit = {
    id,
    patientId: v.patientId || null,
    patientName: v.patientName || null,
    doctorId: v.doctorId || null,
    date: v.date || nowISO(),
    shiftType: v.shiftType || null,
    allergies: !!v.allergies,
    allergyDetails: v.allergyDetails || null,
    chronicDiseases: v.chronicDiseases || null,
    bloodType: v.bloodType || null,
    weight: v.weight || null,
    temperature: v.temperature || null,
    oxygenLevel: v.oxygenLevel || null,
    bloodPressureSystolic: v.bloodPressureSystolic || null,
    bloodPressureDiastolic: v.bloodPressureDiastolic || null,
    heartRate: v.heartRate || null,
    diagnosis: v.diagnosis || null,
    medications: v.medications || [],
    tests: v.tests || [],
    totalAmount: v.totalAmount || 0,
    paidAmount: v.paidAmount || 0,
    isPaid: !!v.isPaid,
    createdAt: nowISO(),
  };
  DB.visits.push(visit);

  // update patient debt
  if (!visit.isPaid && visit.patientId) {
    const debt = (visit.totalAmount || 0) - (visit.paidAmount || 0);
    const patient = DB.patients.find(p => p.id === visit.patientId);
    if (patient) {
      patient.totalDebt = (patient.totalDebt || 0) + debt;
    }
  }

  saveDB(DB);
  res.json(visit);
});

// Medications & doctors simple getters
app.get('/api/medications', (req, res) => {
  res.json(DB.medications.map(m => ({ ...m })));
});

app.post('/api/medications', (req, res) => {
  const m = req.body;
  const id = m.id || Date.now().toString();
  const med = {
    id,
    name: m.name || '',
    description: m.description || null,
    dosageForm: m.dosageForm || null,
    stock: typeof m.stock === 'number' ? m.stock : null,
    createdAt: nowISO(),
  };
  DB.medications.push(med);
  saveDB(DB);
  res.json(med);
});

app.get('/api/doctors', (req, res) => {
  res.json(DB.doctors.map(d => ({ ...d })));
});

app.post('/api/doctors', (req, res) => {
  const d = req.body;
  const id = d.id || Date.now().toString();
  const doc = {
    id,
    name: d.name || '',
    email: d.email || null,
    role: d.role || 'doctor',
    specialization: d.specialization || null,
    phone: d.phone || null,
    shiftRates: d.shiftRates || {},
    shiftCounts: d.shiftCounts || {},
    totalSalary: typeof d.totalSalary === 'number' ? d.totalSalary : 0,
    createdAt: nowISO(),
  };
  DB.doctors.push(doc);
  saveDB(DB);
  res.json(doc);
});

app.listen(PORT, () => {
  console.log(`Backend API (JSON file) listening on http://localhost:${PORT}`);
});
