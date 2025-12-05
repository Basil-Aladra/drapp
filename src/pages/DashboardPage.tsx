import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { DebtBadge } from '@/components/ui/debt-badge';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { Visit, Patient } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { patients, visits, doctors } = useData();

  const totalPatients = patients.length;
  const totalVisits = visits.length;
  const totalDebts = patients.reduce((sum, p) => sum + p.totalDebt, 0);
  const patientsWithDebt = patients.filter(p => p.totalDebt > 0);

  const recentVisits = [...visits]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const visitColumns = [
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
      render: (visit: Visit) => {
        const doc = doctors.find(d => d.id === visit.doctorId);
        return <span>{doc?.name ?? 'Unknown Doctor'}</span>;
      },
    },
    {
      key: 'date',
      header: 'Visit Date',
      render: (visit: Visit) => format(new Date(visit.date), 'MMM dd, yyyy'),
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
      key: 'status',
      header: 'Status',
      render: (visit: Visit) => (
        <DebtBadge amount={visit.totalAmount - visit.paidAmount} size="sm" />
      ),
    },
  ];

  const debtColumns = [
    {
      key: 'name',
      header: 'Patient',
      render: (patient: Patient) => (
        <span className="font-medium text-foreground">{patient.name}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'totalDebt',
      header: 'Debt Amount',
      render: (patient: Patient) => (
        <span className="font-bold text-destructive">${patient.totalDebt.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description="Here's what's happening at your clinic today"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Visits"
          value={totalVisits}
          icon={<Calendar className="w-6 h-6" />}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        {user?.role === 'admin' && (
          <StatCard
            title="Outstanding Debts"
            value={`$${totalDebts.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6" />}
            variant="destructive"
          />
        )}
        <StatCard
          title="Active Doctors"
          value={doctors.length}
          icon={<UserCheck className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visits */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground">
                Recent Visits
              </h2>
            </div>
          </div>
          <DataTable
            columns={visitColumns}
            data={recentVisits}
            emptyMessage="No visits recorded yet"
          />
        </div>

        {/* Debt Alerts */}
        {user?.role === 'admin' && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground">
              Debt Alerts
            </h2>
          </div>
          {patientsWithDebt.length > 0 ? (
            <div className="space-y-3">
              {patientsWithDebt.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                    <span className="font-bold text-destructive">
                      ${patient.totalDebt.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No outstanding debts</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Cases per Doctor */}
      {user?.role === 'admin' && (
        <div className="mt-6 bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">
            Cases per Doctor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.map((doctor) => {
              const doctorVisits = visits.filter(v => v.doctorId === doctor.id).length;
              return (
                <div
                  key={doctor.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <p className="font-medium text-foreground">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  <p className="mt-2 text-2xl font-bold text-primary">{doctorVisits}</p>
                  <p className="text-xs text-muted-foreground">Total Cases</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
