import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getFarmerRequests, getLabourerRequests, updateHiringStatus } from '../services/hiringService';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const STATUS_BADGE = {
  Pending: 'badge-medium',
  Accepted: 'badge-high',
  Rejected: 'badge-low',
  Cancelled: 'badge-low',
  Completed: 'badge-high',
};

// Actions available per role per current status - mirrors the backend's transition matrix.
const ACTIONS = {
  farmer: { Pending: ['Cancelled'], Accepted: ['Cancelled', 'Completed'] },
  labourer: { Pending: ['Accepted', 'Rejected'], Accepted: ['Completed'] },
};

function MyHiringRequests() {
  const { token, user } = useAuth();
  const role = user.role; // 'farmer' | 'labourer'

  const [status, setStatus] = useState('loading');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingId, setActingId] = useState(null);

  function load() {
    setStatus('loading');
    const fetcher = role === 'farmer' ? getFarmerRequests : getLabourerRequests;
    fetcher(token)
      .then((data) => {
        setRequests(data.requests);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token, role]);

  async function handleAction(requestId, nextStatus) {
    setActionError('');
    setActingId(requestId);
    try {
      await updateHiringStatus(token, requestId, nextStatus);
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActingId(null);
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Loading your hiring requests..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load hiring requests. {error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Hiring Requests" title="My hiring requests" />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      {actionError && (
        <p className="form-error" style={{ marginBottom: 'var(--space-md)' }}>
          {actionError}
        </p>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hiring requests"
          description={role === 'farmer' ? "You haven't sent any hiring requests yet." : "You haven't received any hiring requests yet."}
        />
      ) : (
        <div className="crop-grid">
          {requests.map((r) => {
            const other = role === 'farmer' ? r.labourer : r.farmer;
            const actions = ACTIONS[role][r.status] || [];
            return (
              <div className="card card-hover crop-card" key={r.id}>
                <div className="crop-card__header">
                  <span className="crop-card__name">{other.name}</span>
                  <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                </div>
                <p className="crop-card__score">{r.workType}</p>
                <p className="crop-card__score">
                  {new Date(r.workDate).toLocaleDateString('en-IN')} · {r.numberOfDays} day{r.numberOfDays === 1 ? '' : 's'}
                </p>
                <p className="crop-card__score">{r.farmLocation}</p>
                {r.message && <p className="crop-card__explanation">"{r.message}"</p>}
                {other.phone && <p className="crop-card__score">Contact: {other.phone}</p>}
                <p className="form-hint">Requested {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>

                {actions.length > 0 && (
                  <div className="crop-card__footer" style={{ gap: 'var(--space-sm)' }}>
                    {actions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={a === 'Cancelled' || a === 'Rejected' ? 'btn btn-secondary' : 'btn btn-primary'}
                        disabled={actingId === r.id}
                        onClick={() => handleAction(r.id, a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default MyHiringRequests;
