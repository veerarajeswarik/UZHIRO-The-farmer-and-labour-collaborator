import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getReports } from '../../services/adminService';

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="form-hint">{label}</p>
      <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{value}</p>
    </div>
  );
}

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

  if (status === 'loading') return <p>Loading reports...</p>;
  if (status === 'error') return <p className="form-error">Unable to load reports. {error}</p>;

  return (
    <>
      <h2>Platform overview</h2>
      <p className="form-hint">Live counts from the database, generated at {new Date(report.generatedAt).toLocaleString('en-IN')}.</p>

      <div className="crop-grid" style={{ marginTop: 'var(--space-md)' }}>
        <StatCard label="Total users" value={report.users.total} />
        <StatCard label="Farmers" value={report.users.farmers} />
        <StatCard label="Labourers" value={report.users.labourers} />
        <StatCard label="Admins" value={report.users.admins} />
        <StatCard label="Active users" value={report.users.active} />
        <StatCard label="Inactive users" value={report.users.inactive} />
        <StatCard label="Crops in catalog" value={report.content.crops} />
        <StatCard label="Products in catalog" value={report.content.products} />
        <StatCard label="Learning articles" value={report.content.learningArticles} />
        <StatCard label="Government schemes" value={report.content.schemes} />
        <StatCard label="Farm tasks" value={report.activity.farmTasks} />
        <StatCard label="Market price records" value={report.activity.marketPriceRecords} />
      </div>

      <h2 style={{ marginTop: 'var(--space-xl)' }}>Hiring requests by status</h2>
      <div className="crop-grid" style={{ marginTop: 'var(--space-md)' }}>
        {Object.entries(report.activity.hiringRequestsByStatus).map(([status2, count]) => (
          <StatCard key={status2} label={status2} value={count} />
        ))}
      </div>
    </>
  );
}

export default AdminDashboard;
