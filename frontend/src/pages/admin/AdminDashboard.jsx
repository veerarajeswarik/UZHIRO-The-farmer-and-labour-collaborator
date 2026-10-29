import { useEffect, useState } from 'react';
import {
  Users,
  Tractor,
  HardHat,
  ShieldCheck,
  UserCheck,
  UserX,
  Wheat,
  Package,
  BookOpen,
  Landmark,
  CalendarCheck,
  LineChart,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getReports } from '../../services/adminService';
import { Section } from '../../components/Page';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import { ErrorState } from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';

function AdminDashboard() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReports(token)
      .then((d) => {
        setReport(d);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [token]);

  if (status === 'loading') return <LoadingState label="Loading reports..." />;
  if (status === 'error')
    return (
      <Card>
        <ErrorState title="Unable to load reports" message={error} />
      </Card>
    );

  return (
    <>
      <p className="form-hint">Live counts from the database, generated at {new Date(report.generatedAt).toLocaleString('en-IN')}.</p>

      <Section title="Users">
        <div className="stat-grid">
          <StatCard icon={Users} label="Total users" value={report.users.total} />
          <StatCard icon={Tractor} label="Farmers" value={report.users.farmers} />
          <StatCard icon={HardHat} label="Labourers" value={report.users.labourers} />
          <StatCard icon={ShieldCheck} label="Admins" value={report.users.admins} />
          <StatCard icon={UserCheck} label="Active users" value={report.users.active} />
          <StatCard icon={UserX} label="Inactive users" value={report.users.inactive} />
        </div>
      </Section>

      <Section title="Content & activity">
        <div className="stat-grid">
          <StatCard icon={Wheat} label="Crops in catalog" value={report.content.crops} />
          <StatCard icon={Package} label="Products in catalog" value={report.content.products} />
          <StatCard icon={BookOpen} label="Learning articles" value={report.content.learningArticles} />
          <StatCard icon={Landmark} label="Government schemes" value={report.content.schemes} />
          <StatCard icon={CalendarCheck} label="Farm tasks" value={report.activity.farmTasks} />
          <StatCard icon={LineChart} label="Market price records" value={report.activity.marketPriceRecords} />
        </div>
      </Section>

      <Section title="Hiring requests by status">
        <div className="stat-grid">
          {Object.entries(report.activity.hiringRequestsByStatus).map(([status2, count]) => (
            <StatCard key={status2} icon={ClipboardList} label={status2} value={count} />
          ))}
        </div>
      </Section>
    </>
  );
}

export default AdminDashboard;
