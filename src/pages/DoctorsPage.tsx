import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, UserCog, Edit, Trash2, Mail, Phone, Stethoscope } from 'lucide-react';
import { User } from '@/types';

export default function DoctorsPage() {
  const { doctors, visits, addDoctor, updateDoctor, deleteDoctor, updateDoctorShiftRates, updateDoctorShiftCounts, resetDoctorShiftCounts } = useData();
  const { registerDoctor } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<User | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
  });

  const handleAddDoctor = () => {
    if (newDoctor.name && newDoctor.email && newDoctor.password) {
      const created = {
        name: newDoctor.name,
        email: newDoctor.email,
        phone: newDoctor.phone,
        specialization: newDoctor.specialization,
        role: 'doctor' as const,
      };
      const doctorRecord = addDoctor(created);
      if (doctorRecord) {
        registerDoctor(doctorRecord, newDoctor.password);
      }
      setNewDoctor({ name: '', email: '', phone: '', specialization: '', password: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditDoctor = () => {
    if (editingDoctor) {
      updateDoctor(editingDoctor.id, editingDoctor);
      setEditingDoctor(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteDoctor = () => {
    if (deleteId) {
      deleteDoctor(deleteId);
      setDeleteId(null);
    }
  };

  const getDoctorCases = (doctorId: string) => {
    return visits.filter(v => v.doctorId === doctorId).length;
  };

  const doctorColumns = [
    {
      key: 'name',
      header: 'Doctor',
      render: (doctor: User) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center text-primary-foreground font-bold">
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'shiftRates',
      header: 'Shift Rates',
      render: (doctor: User) => {
        const rates = doctor.shiftRates || {};
        const entries = Object.keys(rates).length > 0 ? Object.entries(rates) : [['A', 0], ['B', 0]];
        return (
          <div className="flex flex-wrap gap-2">
            {entries.map(([type, rate]) => (
              <span key={type} className="px-2 py-1 rounded-md bg-muted/50 text-xs font-medium">{type}: ${Number(rate).toFixed(2)}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'shiftCounts',
      header: 'Shift Counts',
      render: (doctor: User) => {
        const counts = doctor.shiftCounts || {};
        const entries = Object.keys(counts).length > 0 ? Object.entries(counts) : [['A', 0], ['B', 0]];
        return (
          <div className="flex flex-wrap gap-2">
            {entries.map(([type, count]) => (
              <span key={type} className="px-2 py-1 rounded-md bg-muted/50 text-xs font-medium">{type}: {Number(count)}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'totalSalary',
      header: 'Total Salary',
      render: (doctor: User) => (
        <span className="font-bold text-primary">${Number(doctor.totalSalary || 0).toFixed(2)}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (doctor: User) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>{doctor.email}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (doctor: User) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{doctor.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'cases',
      header: 'Cases',
      render: (doctor: User) => {
        const cases = getDoctorCases(doctor.id);
        return (
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{cases}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (doctor: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingDoctor(doctor);
              setIsEditDialogOpen(true);
            }}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(doctor.id);
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Doctors"
        description="Manage clinic doctors and staff"
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Doctor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    placeholder="Dr. John Doe"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    placeholder="doctor@clinic.com"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                    placeholder="Enter a password"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    placeholder="e.g., General Medicine, Pediatrics"
                    className="input-medical"
                  />
                </div>
                <Button onClick={handleAddDoctor} className="w-full btn-primary">
                  Add Doctor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {doctors.slice(0, 3).map((doctor) => (
          <div
            key={doctor.id}
            className="stat-card animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full primary-gradient flex items-center justify-center text-primary-foreground font-bold text-lg">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{doctor.name}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Cases</span>
              <span className="text-2xl font-bold text-primary">{getDoctorCases(doctor.id)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <DataTable
          columns={doctorColumns}
          data={doctors}
          emptyMessage="No doctors added yet"
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Doctor</DialogTitle>
          </DialogHeader>
          {editingDoctor && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name *</Label>
                <Input
                  id="editName"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="input-medical"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email *</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingDoctor.email}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                  className="input-medical"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editingDoctor.phone || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                  className="input-medical"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialization">Specialization</Label>
                <Input
                  id="editSpecialization"
                  value={editingDoctor.specialization || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  className="input-medical"
                />
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Shift Rates</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>A</Label>
                    <Input
                      type="number"
                      value={String((editingDoctor.shiftRates?.A) ?? 0)}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, shiftRates: { ...(editingDoctor.shiftRates || {}), A: parseFloat(e.target.value) || 0 } })}
                      className="input-medical"
                    />
                  </div>
                  <div>
                    <Label>B</Label>
                    <Input
                      type="number"
                      value={String((editingDoctor.shiftRates?.B) ?? 0)}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, shiftRates: { ...(editingDoctor.shiftRates || {}), B: parseFloat(e.target.value) || 0 } })}
                      className="input-medical"
                    />
                  </div>
                </div>
                <h4 className="font-medium">Shift Counts</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>A</Label>
                    <Input
                      type="number"
                      value={String((editingDoctor.shiftCounts?.A) ?? 0)}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, shiftCounts: { ...(editingDoctor.shiftCounts || {}), A: parseInt(e.target.value) || 0 } })}
                      className="input-medical"
                    />
                  </div>
                  <div>
                    <Label>B</Label>
                    <Input
                      type="number"
                      value={String((editingDoctor.shiftCounts?.B) ?? 0)}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, shiftCounts: { ...(editingDoctor.shiftCounts || {}), B: parseInt(e.target.value) || 0 } })}
                      className="input-medical"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleEditDoctor} className="w-full btn-primary">
                Save Changes
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!editingDoctor) return;
                    resetDoctorShiftCounts(editingDoctor.id);
                    setEditingDoctor({ ...editingDoctor, shiftCounts: { ...(editingDoctor.shiftCounts || {}), A: 0, B: 0 }, totalSalary: 0 });
                  }}
                >
                  Reset Counts
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!editingDoctor) return;
                    updateDoctorShiftRates(editingDoctor.id, editingDoctor.shiftRates || {});
                    updateDoctorShiftCounts(editingDoctor.id, editingDoctor.shiftCounts || {});
                  }}
                >
                  Apply Shift Updates
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this doctor? This will not delete their associated visits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoctor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
