import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { DebtBadge } from '@/components/ui/debt-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Printer, Calendar, Stethoscope, Trash2, AlertTriangle, Beaker, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Visit, PrescriptionMedication } from '@/types';

export default function VisitsPage() {
  const { user } = useAuth();
  const { patients, visits, medications, doctors, addVisit } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMedications, setSelectedMedications] = useState<PrescriptionMedication[]>([]);
  const [newVisit, setNewVisit] = useState({
    patientId: '',
    allergies: false,
    allergyDetails: '',
    chronicDiseases: '',
    bloodType: '',
    weight: '',
    temperature: '',
    oxygenLevel: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    diagnosis: '',
    totalAmount: '',
    paidAmount: '',
    isPaid: false,
    shiftType: 'A',
  });
  const [currentMedication, setCurrentMedication] = useState({
    medicationId: '',
    quantity: 1,
    dosage: '',
    instructions: '',
  });
  const [selectedTests, setSelectedTests] = useState<{ testName: string; result?: string }[]>([]);
  const [currentTest, setCurrentTest] = useState<{ testName: string; result?: string }>({
    testName: '',
    result: '',
  });

  const handleAddMedication = () => {
    if (currentMedication.medicationId && currentMedication.quantity > 0) {
      const med = medications.find(m => m.id === currentMedication.medicationId);
      if (med) {
        setSelectedMedications([
          ...selectedMedications,
          {
            medicationId: med.id,
            medicationName: med.name,
            quantity: currentMedication.quantity,
            dosage: currentMedication.dosage,
            instructions: currentMedication.instructions,
          },
        ]);
        setCurrentMedication({ medicationId: '', quantity: 1, dosage: '', instructions: '' });
      }
    }
  };

  const handleRemoveMedication = (index: number) => {
    setSelectedMedications(selectedMedications.filter((_, i) => i !== index));
  };

  const handleAddTest = () => {
    if (currentTest.testName.trim()) {
      setSelectedTests([...selectedTests, { testName: currentTest.testName.trim(), result: currentTest.result?.trim() || undefined }]);
      setCurrentTest({ testName: '', result: '' });
    }
  };

  const handleRemoveTest = (index: number) => {
    setSelectedTests(selectedTests.filter((_, i) => i !== index));
  };

  const handleAddVisit = () => {
    if (user?.role !== 'doctor') {
      return;
    }
    const patient = patients.find(p => p.id === newVisit.patientId);
    if (patient && newVisit.diagnosis) {
      addVisit({
        patientId: newVisit.patientId,
        patientName: patient.name,
        doctorId: user?.id || '',
        date: new Date(),
        shiftType: newVisit.shiftType,
        allergies: newVisit.allergies,
        allergyDetails: newVisit.allergyDetails,
        chronicDiseases: newVisit.chronicDiseases,
        bloodType: newVisit.bloodType,
        weight: newVisit.weight ? parseFloat(newVisit.weight) : undefined,
        temperature: newVisit.temperature ? parseFloat(newVisit.temperature) : undefined,
        oxygenLevel: newVisit.oxygenLevel ? parseFloat(newVisit.oxygenLevel) : undefined,
        bloodPressureSystolic: newVisit.bloodPressureSystolic ? parseFloat(newVisit.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: newVisit.bloodPressureDiastolic ? parseFloat(newVisit.bloodPressureDiastolic) : undefined,
        heartRate: newVisit.heartRate ? parseFloat(newVisit.heartRate) : undefined,
        diagnosis: newVisit.diagnosis,
        medications: selectedMedications,
        tests: selectedTests,
        totalAmount: parseFloat(newVisit.totalAmount) || 0,
        paidAmount: parseFloat(newVisit.paidAmount) || 0,
        isPaid: newVisit.isPaid,
      });
      setNewVisit({
        patientId: '',
        allergies: false,
        allergyDetails: '',
        chronicDiseases: '',
        bloodType: '',
        weight: '',
        temperature: '',
        oxygenLevel: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        diagnosis: '',
        totalAmount: '',
        paidAmount: '',
        isPaid: false,
        shiftType: 'A',
      });
      setSelectedMedications([]);
      setSelectedTests([]);
      setIsAddDialogOpen(false);
    }
  };

  const handlePrintPrescription = (visit: Visit) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription - ${visit.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #0d9488; margin: 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 3px; }
            .info-item { padding: 10px; background: #f5f5f5; border-radius: 8px; }
            .info-label { font-weight: bold; color: #666; font-size: 8px; }
            .medications { margin-top: 12px; }
            .medication { padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; }
            .medication-name { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MediClinic</h1>
            <p>Medical Prescription</p>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div>${visit.patientName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Doctor</div>
              <div>${(doctors.find(d => d.id === visit.doctorId)?.name) ?? 'Unknown Doctor'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Visit Date</div>
              <div>${format(new Date(visit.date), 'MMMM dd, yyyy')}</div>
            </div>
          </div>
          <div>
            <strong>Diagnosis:</strong>
            <p>${visit.diagnosis}</p>
          </div>
          <div class="medications">
            <h3>Prescribed Medications</h3>
            ${visit.medications.map(med => `
              <div class="medication">
                <div class="medication-name">${med.medicationName}</div>
                <div>Quantity: ${med.quantity}</div>
                <div>Dosage: ${med.dosage}</div>
                ${med.instructions ? `<div>Instructions: ${med.instructions}</div>` : ''}
              </div>
            `).join('')}
          </div>
          <div class="footer">
            <p>This prescription was generated by MediClinic Management System</p>
            <p>Printed on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const visitColumns = [
    {
      key: 'date',
      header: 'Visit Date',
      render: (visit: Visit) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{format(new Date(visit.date), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient',
      render: (visit: Visit) => (
        <span className="font-medium text-foreground">{visit.patientName}</span>
      ),
    },
    {
      key: 'doctorId',
      header: 'Doctor Name',
      render: (visit: Visit) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-muted-foreground" />
          <span>{(doctors.find(d => d.id === visit.doctorId)?.name) || 'Unknown Doctor'}</span>
        </div>
      ),
    },
    {
      key: 'shiftType',
      header: 'Shift Type',
      render: (visit: Visit) => (
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-muted-foreground" />
          <span>{visit.shiftType || '-'}</span>
        </div>
      ),
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (visit: Visit) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">
          {visit.diagnosis}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (visit: Visit) => (
        <span className="font-medium">${visit.totalAmount.toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (visit: Visit) => (
        <DebtBadge amount={visit.totalAmount - visit.paidAmount} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (visit: Visit) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handlePrintPrescription(visit);
          }}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print
        </Button>
      ),
    },
  ];

  const selectedPatient = patients.find(p => p.id === newVisit.patientId);
  const selectablePatients = patients;
  const displayVisits = visits;

  return (
    <MainLayout>
      <PageHeader
        title="Visits"
        description="Manage patient visits and prescriptions"
        action={
          user?.role === 'doctor' ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  New Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Add New Visit</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label>Select Patient *</Label>
                  <Select
                    value={newVisit.patientId}
                    onValueChange={(value) => setNewVisit({ ...newVisit, patientId: value })}
                  >
                    <SelectTrigger className="input-medical">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectablePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Debt Warning */}
                {selectedPatient && selectedPatient.totalDebt > 0 && (
                  <div className="p-4 rounded-lg debt-alert border flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Outstanding Debt Warning</p>
                      <p className="text-sm">This patient has ${selectedPatient.totalDebt.toFixed(2)} in unpaid bills.</p>
                    </div>
                  </div>
                )}

                {/* Vitals */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newVisit.weight}
                        onChange={(e) => setNewVisit({ ...newVisit, weight: e.target.value })}
                        placeholder="e.g., 70"
                        className="input-medical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temp (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={newVisit.temperature}
                        onChange={(e) => setNewVisit({ ...newVisit, temperature: e.target.value })}
                        placeholder="e.g., 36.6"
                        className="input-medical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygen">O2 Level (%)</Label>
                      <Input
                        id="oxygen"
                        type="number"
                        value={newVisit.oxygenLevel}
                        onChange={(e) => setNewVisit({ ...newVisit, oxygenLevel: e.target.value })}
                        placeholder="e.g., 98"
                        className="input-medical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heartRate">Heart Rate</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        value={newVisit.heartRate}
                        onChange={(e) => setNewVisit({ ...newVisit, heartRate: e.target.value })}
                        placeholder="e.g., 72"
                        className="input-medical"
                      />
                    </div>
                    {/* Blood Pressure Inputs (disabled for doctors) */}
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureSystolic">BP Systolic</Label>
                      <Input
                        id="bloodPressureSystolic"
                        type="number"
                        value={newVisit.bloodPressureSystolic}
                        onChange={(e) => setNewVisit({ ...newVisit, bloodPressureSystolic: e.target.value })}
                        placeholder="e.g., 120"
                        className="input-medical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureDiastolic">BP Diastolic</Label>
                      <Input
                        id="bloodPressureDiastolic"
                        type="number"
                        value={newVisit.bloodPressureDiastolic}
                        onChange={(e) => setNewVisit({ ...newVisit, bloodPressureDiastolic: e.target.value })}
                        placeholder="e.g., 80"
                        className="input-medical"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input
                      id="bloodType"
                      value={newVisit.bloodType}
                      onChange={(e) => setNewVisit({ ...newVisit, bloodType: e.target.value })}
                      placeholder="e.g., A+, B-"
                      className="input-medical"
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-8">
                    <Switch
                      checked={newVisit.allergies}
                      onCheckedChange={(checked) => setNewVisit({ ...newVisit, allergies: checked })}
                    />
                    <Label>Patient has allergies</Label>
                  </div>
                </div>

                {/* Shift Type */}
                <div className="space-y-2">
                  <Label>Shift Type</Label>
                  <Select
                    value={newVisit.shiftType}
                    onValueChange={(value) => setNewVisit({ ...newVisit, shiftType: value })}
                  >
                    <SelectTrigger className="input-medical">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newVisit.allergies && (
                  <div className="space-y-2">
                    <Label htmlFor="allergyDetails">Allergy Details</Label>
                    <Input
                      id="allergyDetails"
                      value={newVisit.allergyDetails}
                      onChange={(e) => setNewVisit({ ...newVisit, allergyDetails: e.target.value })}
                      placeholder="List known allergies"
                      className="input-medical"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="chronicDiseases">Chronic Diseases</Label>
                  <Input
                    id="chronicDiseases"
                    value={newVisit.chronicDiseases}
                    onChange={(e) => setNewVisit({ ...newVisit, chronicDiseases: e.target.value })}
                    placeholder="List chronic conditions"
                    className="input-medical"
                  />
                </div>

                {/* Diagnosis */}
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    value={newVisit.diagnosis}
                    onChange={(e) => setNewVisit({ ...newVisit, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis details"
                    className="input-medical min-h-[100px]"
                  />
                </div>

                {/* Medications */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Medications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="col-span-2">
                      <Select
                        value={currentMedication.medicationId}
                        onValueChange={(value) => setCurrentMedication({ ...currentMedication, medicationId: value })}
                      >
                        <SelectTrigger className="input-medical">
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      value={currentMedication.quantity}
                      onChange={(e) => setCurrentMedication({ ...currentMedication, quantity: parseInt(e.target.value) || 1 })}
                      placeholder="Qty"
                      className="input-medical"
                    />
                    <Input
                      value={currentMedication.dosage}
                      onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value })}
                      placeholder="Dosage"
                      className="input-medical"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMedication}
                    className="mb-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                  {selectedMedications.length > 0 && (
                    <div className="space-y-2">
                      {selectedMedications.map((med, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div>
                            <p className="font-medium">{med.medicationName}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {med.quantity} | Dosage: {med.dosage}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medical Tests */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Medical Tests</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <Input
                      value={currentTest.testName}
                      onChange={(e) => setCurrentTest({ ...currentTest, testName: e.target.value })}
                      placeholder="Test name (e.g., CBC, X-Ray)"
                      className="input-medical col-span-2"
                    />
                    <Input
                      value={currentTest.result}
                      onChange={(e) => setCurrentTest({ ...currentTest, result: e.target.value })}
                      placeholder="Result (optional)"
                      className="input-medical col-span-2"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTest}
                    className="mb-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test
                  </Button>
                  {selectedTests.length > 0 && (
                    <div className="space-y-2">
                      {selectedTests.map((test, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <Beaker className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{test.testName}</p>
                              {test.result && (
                                <p className="text-sm text-muted-foreground">Result: {test.result}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTest(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Payment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount ($)</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        value={newVisit.totalAmount}
                        onChange={(e) => setNewVisit({ ...newVisit, totalAmount: e.target.value })}
                        placeholder="0.00"
                        className="input-medical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">Paid Amount ($)</Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        value={newVisit.paidAmount}
                        onChange={(e) => setNewVisit({ ...newVisit, paidAmount: e.target.value })}
                        placeholder="0.00"
                        className="input-medical"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <Switch
                      checked={newVisit.isPaid}
                      onCheckedChange={(checked) => setNewVisit({ ...newVisit, isPaid: checked })}
                    />
                    <Label>Fully Paid</Label>
                  </div>
                </div>

                <Button onClick={handleAddVisit} className="w-full btn-primary">
                  Record Visit
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <DataTable
          columns={visitColumns}
          data={displayVisits}
          emptyMessage="No visits recorded"
        />
      </div>
    </MainLayout>
  );
}
