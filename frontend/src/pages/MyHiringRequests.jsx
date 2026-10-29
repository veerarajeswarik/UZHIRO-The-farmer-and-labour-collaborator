import { useEffect, useState } from 'react';
import { ClipboardList, Briefcase, CalendarDays, Clock, MapPin, Phone, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getFarmerRequests, getLabourerRequests, updateHiringStatus } from '../services/hiringService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { StatusBadge } from '../components/Badge';
import SkeletonGrid from '../components/Skeleton';
import EmptyState, { ErrorState } from '../components/EmptyState';
import { initials, formatDate } from '../utils/format';

const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'];

// Actions available per role per current status - mirrors the backend's transition matrix.
const ACTIONS = {
  farmer: { Pending: ['Cancelled'], Accepted: ['Cancelled', 'Completed'] },
  labourer: { Pending: ['Accepted', 'Rejected'], Accepted: ['Completed'] },
};

const ACTION_LABEL = { Cancelled: 'Cancel', Completed: 'Mark completed', Accepted: 'Accept', Rejected: 'Reject' };
const ACTION_VARIANT = { Cancelled: 'danger', Rejected: 'danger', Accepted: 'primary', Completed: 'primary' };

function MyHiringRequests() {
  const { token, user } = useAuth();
  const role = user.role; // 'farmer' | 'labourer'

  const [status, setStatus] = useState('loading');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  function load() {
    setStatus('loading');
    const fetcher = role === 'farmer' ? getFarmerRequests : getLabourerRequests;
    fetcher(token)
      .then((data) => {
        setRequests(data.requests);
        setStatus('ready');
      })
      .catch((err) => {
        setError(friendlyError(err, 'Hiring requests'));
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
      setActionError(friendlyError(err, 'This request'));
    } finally {
      setActingId(null);
    }
  }

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: requests.filter((r) => r.status === s).length }), {});
  // Fall back to "All" if the chosen status no longer has any requests.
  const activeFilter = statusFilter !== 'All' && counts[statusFilter] > 0 ? statusFilter : 'All';
  const visible = activeFilter === 'All' ? requests : requests.filter((r) => r.status === activeFilter);

  return (
    <Page>
      <PageHeader
        eyebrow="Labour Connection"
        pillar="labour"
        title="Hiring Requests"
        description={
          role === 'farmer'
            ? 'Track your labour requirements and the status of every request you have sent.'
            : 'Review requests from farmers and respond to the work you want to take on.'
        }
        actions={
          role === 'farmer' && (
            <Button to="/labourers" icon={Users}>
              Find labour
            </Button>
          )
        }
      />

      {status === 'loading' && <SkeletonGrid count={3} label="Loading your hiring requests..." />}

      {status === 'error' && (
        <Card>
          <ErrorState title="Unable to load hiring requests" message={error} />
        </Card>
      )}

      {status === 'ready' && (
        <>
          {requests.length > 0 && (
            <div className="status-tabs" role="group" aria-label="Filter by status">
              {['All', ...STATUSES].map((s) => {
                const n = s === 'All' ? requests.length : counts[s];
                if (s !== 'All' && n === 0) return null;
                return (
                  <button
                    key={s}
                    type="button"
                    className={`status-tab${activeFilter === s ? ' is-active' : ''}`}
                    aria-pressed={activeFilter === s}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s}
                    <span className="status-tab__count">{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          {actionError && <p className="form-error">{actionError}</p>}

          {requests.length === 0 ? (
            <Card>
              <EmptyState
                icon={ClipboardList}
                title="No hiring requests yet"
                description={
                  role === 'farmer'
                    ? "You haven't sent any hiring requests yet. Find a labourer to get started."
                    : "You haven't received any hiring requests yet. Keep your profile up to date so farmers can find you."
                }
                action={
                  role === 'farmer' ? (
                    <Button to="/labourers">Find labour</Button>
                  ) : (
                    <Button to="/labourer/profile" variant="secondary">
                      Update my profile
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <Section className="page-section--flush">
              <div className="item-grid">
                {visible.map((r) => {
                  const other = role === 'farmer' ? r.labourer : r.farmer;
                  const actions = ACTIONS[role][r.status] || [];
                  return (
                    <Card key={r.id} className="item-card request-card">
                      <div className="labour-card__top">
                        <span className="avatar" aria-hidden="true">
                          {initials(other.name)}
                        </span>
                        <div className="labour-card__who">
                          <span className="meta">{role === 'farmer' ? 'Labourer' : 'Farmer'}</span>
                          <h3 className="item-card__title">{other.name}</h3>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>

                      <dl className="detail-list detail-list--compact">
                        <div className="detail-list__row">
                          <dt className="inline-meta">
                            <Briefcase size={14} strokeWidth={2} aria-hidden="true" /> Work
                          </dt>
                          <dd>{r.workType}</dd>
                        </div>
                        <div className="detail-list__row">
                          <dt className="inline-meta">
                            <CalendarDays size={14} strokeWidth={2} aria-hidden="true" /> Start date
                          </dt>
                          <dd>{formatDate(r.workDate)}</dd>
                        </div>
                        <div className="detail-list__row">
                          <dt className="inline-meta">
                            <Clock size={14} strokeWidth={2} aria-hidden="true" /> Duration
                          </dt>
                          <dd>
                            {r.numberOfDays} day{r.numberOfDays === 1 ? '' : 's'}
                          </dd>
                        </div>
                        <div className="detail-list__row">
                          <dt className="inline-meta">
                            <MapPin size={14} strokeWidth={2} aria-hidden="true" /> Farm location
                          </dt>
                          <dd>{r.farmLocation}</dd>
                        </div>
                        {other.phone && (
                          <div className="detail-list__row">
                            <dt className="inline-meta">
                              <Phone size={14} strokeWidth={2} aria-hidden="true" /> Contact
                            </dt>
                            <dd>
                              <a href={`tel:${other.phone}`}>{other.phone}</a>
                            </dd>
                          </div>
                        )}
                      </dl>

                      {r.message && <p className="item-card__body request-card__message">“{r.message}”</p>}

                      <div className="item-card__footer">
                        <span className="meta">Requested {formatDate(r.createdAt)}</span>
                        {actions.map((a) => (
                          <Button
                            key={a}
                            size="sm"
                            variant={ACTION_VARIANT[a]}
                            disabled={actingId === r.id}
                            onClick={() => handleAction(r.id, a)}
                          >
                            {ACTION_LABEL[a]}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Section>
          )}
        </>
      )}
    </Page>
  );
}

export default MyHiringRequests;
