import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { DebtBadge } from '@/components/ui/debt-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Plus, Search, User, Calendar, Phone, Droplets, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Patient, Visit } from '@/types';

export default function PatientsPage() {
  const { patients, visits, doctors, addPatient, getPatientVisits } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
  });

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.dateOfBirth) {
      addPatient({
        name: newPatient.name,
        dateOfBirth: new Date(newPatient.dateOfBirth),
        phone: newPatient.phone,
        bloodType: newPatient.bloodType,
        allergies: newPatient.allergies,
        chronicDiseases: newPatient.chronicDiseases,
        ownerDoctorId: undefined,
      });
      setNewPatient({
        name: '',
        dateOfBirth: '',
        phone: '',
        bloodType: '',
        allergies: '',
        chronicDiseases: '',
      });
      setIsAddDialogOpen(false);
    }
  };

  const patientColumns = [
    {
      key: 'name',
      header: 'Patient Name',
      render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-foreground">{patient.name}</span>
        </div>
      ),
    },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      render: (patient: Patient) => format(new Date(patient.dateOfBirth), 'MMM dd, yyyy'),
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'bloodType',
      header: 'Blood Type',
      render: (patient: Patient) => (
        <span className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
          {patient.bloodType || 'N/A'}
        </span>
      ),
    },
    {
      key: 'totalDebt',
      header: 'Debt Status',
      render: (patient: Patient) => <DebtBadge amount={patient.totalDebt} />,
    },
  ];

  const patientVisits = selectedPatient ? getPatientVisits(selectedPatient.id) : [];

  return (
    <MainLayout>
      <PageHeader
        title="Patients"
        description="Manage your clinic patients"
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="Enter patient name"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                    placeholder="e.g., A+, B-, O+"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="Known allergies"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chronicDiseases">Chronic Diseases</Label>
                  <Input
                    id="chronicDiseases"
                    value={newPatient.chronicDiseases}
                    onChange={(e) => setNewPatient({ ...newPatient, chronicDiseases: e.target.value })}
                    placeholder="Known chronic conditions"
                    className="input-medical"
                  />
                </div>
                <Button onClick={handleAddPatient} className="w-full btn-primary">
                  Add Patient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 input-medical"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <DataTable
          columns={patientColumns}
          data={filteredPatients}
          onRowClick={(patient) => setSelectedPatient(patient as Patient)}
          emptyMessage="No patients found"
        />
      </div>

      {/* Patient Details Sheet */}
      <Sheet open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Patient Details</SheetTitle>
          </SheetHeader>
          {selectedPatient && (
            <div className="mt-6 space-y-6">
              {/* Patient Info Card */}
              <div className="p-6 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-muted-foreground">
                      DOB: {format(new Date(selectedPatient.dateOfBirth), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium">{selectedPatient.bloodType || 'N/A'}</span>
                  </div>
                </div>
                {selectedPatient.allergies && (
                  <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Allergies:</span>
                    </div>
                    <p className="text-sm mt-1">{selectedPatient.allergies}</p>
                  </div>
                )}
              </div>

              {/* Debt Alert */}
              {selectedPatient.totalDebt > 0 && (
                <div className="p-4 rounded-xl debt-alert border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Outstanding Debt</span>
                    </div>
                    <span className="text-xl font-bold">
                      ${selectedPatient.totalDebt.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Visit History */}
              <div>
                <h4 className="font-display font-semibold text-lg mb-4">Visit History</h4>
                {patientVisits.length > 0 ? (
                  <div className="space-y-3">
                    {patientVisits.map((visit: Visit) => (
                      <div
                        key={visit.id}
                        className="p-4 rounded-xl bg-card border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              {format(new Date(visit.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <DebtBadge
                            amount={visit.totalAmount - visit.paidAmount}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Doctor:</span> {(() => {
                            const doc = doctors.find(d => d.id === visit.doctorId);
                            return doc?.name ?? 'Unknown Doctor';
                          })()} {visit.shiftType ? `• Shift: ${visit.shiftType}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">
                            Total: ${visit.totalAmount.toFixed(2)}
                          </span>
                          <span className="text-sm text-success font-medium">
                            Paid: ${visit.paidAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Medications List */}
                        {visit.medications && visit.medications.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-foreground mb-2">Medications</h5>
                            <div className="space-y-2">
                              {visit.medications.map((med) => (
                                <div key={`${visit.id}-${med.medicationId}`} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                                  <span className="text-sm font-medium">{med.medicationName}</span>
                                  <span className="text-xs text-muted-foreground">Qty: {med.quantity} • Dosage: {med.dosage}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medical Tests */}
                        {visit.tests && visit.tests.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-foreground mb-2">Medical Tests</h5>
                            <div className="space-y-2">
                              {visit.tests.map((test, idx) => (
                                <div key={`${visit.id}-test-${idx}`} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                                  <span className="text-sm font-medium">{test.testName}</span>
                                  {test.result && (
                                    <span className="text-xs text-muted-foreground">Result: {test.result}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No visits recorded
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
