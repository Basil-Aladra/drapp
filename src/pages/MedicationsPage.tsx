import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pill, Edit, Trash2 } from 'lucide-react';
import { Medication } from '@/types';

const dosageForms = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'drops', label: 'Drops' },
  { value: 'other', label: 'Other' },
];

export default function MedicationsPage() {
  const { medications, addMedication, updateMedication, deleteMedication } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    description: '',
    dosageForm: 'tablet' as Medication['dosageForm'],
  });

  const handleAddMedication = () => {
    if (newMedication.name) {
      addMedication({
        name: newMedication.name,
        description: newMedication.description,
        dosageForm: newMedication.dosageForm,
      });
      setNewMedication({ name: '', description: '', dosageForm: 'tablet' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditMedication = () => {
    if (editingMedication) {
      updateMedication(editingMedication.id, editingMedication);
      setEditingMedication(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteMedication = () => {
    if (deleteId) {
      deleteMedication(deleteId);
      setDeleteId(null);
    }
  };

  const getDosageFormBadge = (form: string) => {
    const colors: Record<string, string> = {
      tablet: 'bg-primary/10 text-primary',
      capsule: 'bg-chart-2/10 text-chart-2',
      syrup: 'bg-warning/10 text-warning',
      injection: 'bg-destructive/10 text-destructive',
      cream: 'bg-success/10 text-success',
      drops: 'bg-chart-1/10 text-chart-1',
      other: 'bg-muted text-muted-foreground',
    };
    return colors[form] || colors.other;
  };

  const medicationColumns = [
    {
      key: 'name',
      header: 'Medication Name',
      render: (med: Medication) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-foreground">{med.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (med: Medication) => (
        <span className="text-muted-foreground truncate max-w-[300px] block">
          {med.description}
        </span>
      ),
    },
    {
      key: 'dosageForm',
      header: 'Form',
      render: (med: Medication) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDosageFormBadge(med.dosageForm)}`}>
          {med.dosageForm}
        </span>
      ),
    },
    
    {
      key: 'actions',
      header: 'Actions',
      render: (med: Medication) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingMedication(med);
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
              setDeleteId(med.id);
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
        title="Medications"
        description="Manage your medication inventory"
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Medication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    placeholder="Enter medication name"
                    className="input-medical"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMedication.description}
                    onChange={(e) => setNewMedication({ ...newMedication, description: e.target.value })}
                    placeholder="Enter description"
                    className="input-medical min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosageForm">Dosage Form</Label>
                  <Select
                    value={newMedication.dosageForm}
                    onValueChange={(value) => setNewMedication({ ...newMedication, dosageForm: value as Medication['dosageForm'] })}
                  >
                    <SelectTrigger className="input-medical">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleAddMedication} className="w-full btn-primary">
                  Add Medication
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <DataTable
          columns={medicationColumns}
          data={medications}
          emptyMessage="No medications added yet"
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Medication</DialogTitle>
          </DialogHeader>
          {editingMedication && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Medication Name *</Label>
                <Input
                  id="editName"
                  value={editingMedication.name}
                  onChange={(e) => setEditingMedication({ ...editingMedication, name: e.target.value })}
                  className="input-medical"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingMedication.description}
                  onChange={(e) => setEditingMedication({ ...editingMedication, description: e.target.value })}
                  className="input-medical min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDosageForm">Dosage Form</Label>
                <Select
                  value={editingMedication.dosageForm}
                  onValueChange={(value) => setEditingMedication({ ...editingMedication, dosageForm: value as Medication['dosageForm'] })}
                >
                  <SelectTrigger className="input-medical">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dosageForms.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleEditMedication} className="w-full btn-primary">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medication? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedication}
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
