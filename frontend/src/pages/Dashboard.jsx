import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Sprout,
  Calculator,
  Users,
  Bot,
  MapPin,
  Landmark,
  Wallet,
  ListChecks,
  CloudSun,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Ruler,
  Mountain,
  Droplets,
  CalendarCheck,
  Brain,
  Handshake,
  UserCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDashboard } from '../services/dashboardService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Button from '../components/Button';
import ActionCard from '../components/ActionCard';
import IconTile from '../components/IconTile';
import { StatusBadge } from '../components/Badge';
import EmptyState, { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { currency, formatDate, greeting } from '../utils/format';

const FARM_ACTIONS = [
  { to: '/crops', icon: Sprout, title: 'Crop Selection', description: 'Find suitable crops based on your farm conditions.' },
  { to: '/profit', icon: Calculator, title: 'Cost & Profit', description: 'Understand estimated costs, revenue and profit.' },
  { to: '/planner', icon: CalendarCheck, title: 'Farm Planner', description: 'Manage upcoming farm activities.' },
  { to: '/assistant', icon: Bot, title: 'AI Assistant', description: 'Ask farming-related questions.' },
];

const LABOUR_ACTIONS = [
  { to: '/labourers', icon: Users, title: 'Find Labour', description: 'Search available agricultural workers.' },
  { to: '/hiring', icon: ClipboardList, title: 'Hiring Requests', description: 'Track your labour requests.' },
];

const QUICK_ACTIONS = [
  { label: 'Find Crops', to: '/crops', icon: Sprout },
  { label: 'Compare Crops', to: '/crops/compare', icon: ListChecks },
  { label: 'Estimate Profit', to: '/profit', icon: Calculator },
  { label: 'Find Labour', to: '/labourers', icon: Users, tone: 'labour' },
  { label: 'Ask AI', to: '/assistant', icon: Bot },
];

function notSet(value, suffix = '') {
  return value != null && value !== '' ? `${value}${suffix}` : 'Not set';
}

function FarmerDashboard({ data }) {
  const { farmSummary, topCropRecommendation, financialSummary, upcomingTasks, weather, recentHiringRequests, learningRecommendations } =
    data;
  const pendingRequests = recentHiringRequests.filter((r) => r.status === 'Pending').length;

  return (
    <Page>
      <PageHeader
        eyebrow={`Season: ${data.season}`}
        title={`${greeting()}, ${data.welcomeName}`}
        description="Your farm at a glance - and the next useful thing you can do today."
        actions={
          <>
            <Button to="/crops" variant="secondary" icon={Sprout}>
              Choose a crop
            </Button>
            <Button to="/labourers" icon={Users}>
              Find labour
            </Button>
          </>
        }
      />

      {/* Farm summary */}
      <Section
        className="page-section--flush"
        title="Farm summary"
        actions={
          <Button to="/farmer/profile" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
            {farmSummary.profileComplete ? 'Edit farm profile' : 'Complete farm profile'}
          </Button>
        }
      >
        {!farmSummary.profileComplete && (
          <p className="notice">
            <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
            Add your soil type and water availability to unlock crop recommendations and profit estimates.
          </p>
        )}
        <div className="stat-grid">
          <StatCard icon={MapPin} label="Location" value={notSet(farmSummary.location)} meta={farmSummary.farmName || undefined} />
          <StatCard icon={Ruler} label="Land area" value={notSet(farmSummary.landAreaAcres, ' acres')} />
          <StatCard icon={Mountain} label="Soil type" value={notSet(farmSummary.soilType)} />
          <StatCard icon={Droplets} label="Water availability" value={notSet(farmSummary.waterAvailability)} />
        </div>
      </Section>

      {/* The two UZHIRO pillars */}
      <Section
        title="What can UZHIRO help you with?"
        description="Plan your farm with better information, and find labour when you need it."
      >
        <div className="pillar-grid">
          <div className="pillar-panel pillar-panel--farm">
            <div className="pillar-panel__head">
              <span className="icon-tile" aria-hidden="true">
                <Brain size={20} strokeWidth={2} />
              </span>
              <div>
                <span className="eyebrow eyebrow--farm">Farm Intelligence</span>
                <p>Decide what to grow, what it will cost, and what to do next.</p>
              </div>
            </div>
            <div className="pillar-panel__actions">
              {FARM_ACTIONS.map((a) => (
                <ActionCard key={a.to} {...a} tone="farm" />
              ))}
            </div>
          </div>

          <div className="pillar-panel pillar-panel--labour">
            <div className="pillar-panel__head">
              <span className="icon-tile icon-tile--labour" aria-hidden="true">
                <Handshake size={20} strokeWidth={2} />
              </span>
              <div>
                <span className="eyebrow eyebrow--labour">Labour Connection</span>
                <p>Find reliable agricultural workers by location, availability and wage.</p>
              </div>
            </div>
            <div className="pillar-panel__actions pillar-panel__actions--single">
              {LABOUR_ACTIONS.map((a) => (
                <ActionCard key={a.to} {...a} tone="labour" />
              ))}
            </div>
            {recentHiringRequests.length > 0 && (
              <div className="pillar-panel__recent">
                <span className="meta">
                  Recent requests{pendingRequests > 0 ? ` · ${pendingRequests} pending` : ''}
                </span>
                <ul className="mini-list">
                  {recentHiringRequests.map((r) => (
                    <li key={r.id}>
                      <span>
                        <strong>{r.labourerName}</strong> · {r.workType}
                      </span>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Recommendation + insight */}
      <Section title="Recommended for your farm">
        <div className="insight-grid">
          <Card className="insight-card">
            <Card.Header>
              <Card.Title icon={Sprout}>Top crop match</Card.Title>
            </Card.Header>
            {topCropRecommendation ? (
              <>
                <div className="insight-card__headline">
                  <IconTile fallback="crop" size="lg" />
                  <div>
                    <h3 className="item-card__title">{topCropRecommendation.crop.name}</h3>
                    <StatusBadge status={topCropRecommendation.level} label={`${topCropRecommendation.level} suitability`} />
                  </div>
                </div>
                <div className="crop-rec__score">
                  <div className="progress-bar" aria-hidden="true">
                    <div className="progress-bar__fill" style={{ width: `${topCropRecommendation.score}%` }} />
                  </div>
                  <span className="meta">
                    Suitability score <strong>{topCropRecommendation.score}/100</strong>
                  </span>
                </div>
                <p className="item-card__body">{topCropRecommendation.explanation}</p>
                <Card.Footer>
                  <Button to={`/crops/${topCropRecommendation.crop.id}`} variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                    View details
                  </Button>
                  <Button to="/crops" variant="ghost" size="sm">
                    See all crops
                  </Button>
                </Card.Footer>
              </>
            ) : (
              <EmptyState
                icon={Sprout}
                title="No recommendation yet"
                description="Complete your farm profile to see a personalized crop recommendation."
                action={
                  <Button to="/farmer/profile" size="sm">
                    Complete farm profile
                  </Button>
                }
              />
            )}
          </Card>

          <div className="stack">
            <Card>
              <Card.Header>
                <Card.Title icon={Wallet}>Estimated profit</Card.Title>
              </Card.Header>
              {financialSummary ? (
                <>
                  <p className="big-number">{currency(financialSummary.estimatedProfit)}</p>
                  <p className="meta">
                    for {financialSummary.crop.name} on your land · investment {currency(financialSummary.estimatedInvestment)} · revenue{' '}
                    {currency(financialSummary.expectedRevenue)}
                  </p>
                  {financialSummary.disclaimer && <p className="form-hint">{financialSummary.disclaimer}</p>}
                  <Card.Footer>
                    <Button to="/profit" variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                      Open Cost & Profit
                    </Button>
                  </Card.Footer>
                </>
              ) : (
                <p className="meta">Set your land area and complete your farm profile to see an estimate.</p>
              )}
            </Card>

            <Card>
              <Card.Header>
                <Card.Title icon={CloudSun}>Farming insight</Card.Title>
              </Card.Header>
              {weather ? (
                <>
                  <p className="weather-inline">
                    <strong>{Math.round(weather.temperatureC)}°C</strong> {weather.description}
                  </p>
                  {weather.topInsight && <p className="item-card__body">{weather.topInsight}</p>}
                  {weather.alertCount > 0 && (
                    <p className="notice notice--warning">
                      <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
                      {weather.alertCount} weather alert{weather.alertCount === 1 ? '' : 's'}
                    </p>
                  )}
                  <Card.Footer>
                    <Button to="/weather" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                      View full forecast
                    </Button>
                  </Card.Footer>
                </>
              ) : (
                <p className="meta">Weather is currently unavailable.</p>
              )}
            </Card>
          </div>
        </div>
      </Section>

      {/* Upcoming tasks */}
      <Section
        title="Upcoming farm tasks"
        actions={
          <Button to="/planner" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
            Open Farm Planner
          </Button>
        }
      >
        {upcomingTasks.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming tasks"
              description="Add tasks in your farm planner to see them here."
              action={
                <Button to="/planner" variant="secondary" size="sm">
                  Plan a task
                </Button>
              }
            />
          </Card>
        ) : (
          <Card className="list-card">
            <ul className="task-list">
              {upcomingTasks.map((t) => (
                <li key={t.id}>
                  <span className="task-list__title">{t.title}</span>
                  <span className="chip">{t.type}</span>
                  <span className="meta">{formatDate(t.dueDate)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      {/* Quick actions */}
      <Section title="Quick actions">
        <div className="quick-grid">
          {QUICK_ACTIONS.map((a) => (
            <Card as={Link} to={a.to} hover key={a.label} className="quick-action">
              <span className={`icon-tile${a.tone === 'labour' ? ' icon-tile--labour' : ''}`} aria-hidden="true">
                <a.icon size={20} strokeWidth={2} />
              </span>
              {a.label}
            </Card>
          ))}
        </div>
      </Section>

      {/* Secondary: keep learning */}
      <Section title="Keep learning">
        <div className="two-col">
          <Card>
            <Card.Header>
              <Card.Title icon={BookOpen}>Recommended reading</Card.Title>
            </Card.Header>
            {learningRecommendations.length === 0 ? (
              <p className="meta">No recommendations right now.</p>
            ) : (
              <ul className="mini-list">
                {learningRecommendations.map((a) => (
                  <li key={a.id}>
                    <Link to={`/learning/${a.id}`}>{a.title}</Link>
                    <span className="meta">{a.category}</span>
                  </li>
                ))}
              </ul>
            )}
            <Card.Footer>
              <Button to="/learning" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Browse Learning Hub
              </Button>
            </Card.Footer>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title icon={Landmark}>Government schemes</Card.Title>
            </Card.Header>
            <p className="item-card__body">Discover financial support, insurance and irrigation programs for farmers.</p>
            <Card.Footer>
              <Button to="/schemes" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Browse schemes
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </Section>
    </Page>
  );
}

function LabourerDashboard({ data }) {
  const { profileSummary, recentHiringRequests } = data;

  return (
    <Page>
      <PageHeader
        eyebrow="Labour Connection"
        pillar="labour"
        title={`${greeting()}, ${data.welcomeName}`}
        description="Track your hiring requests and keep your profile up to date so farmers can find you."
        actions={
          <Button to="/hiring" icon={ClipboardList}>
            View hiring requests
          </Button>
        }
      />

      <div className="insight-grid">
        <Card>
          <Card.Header
            actions={
              <Button to="/labourer/profile" variant="secondary" size="sm">
                Edit profile
              </Button>
            }
          >
            <Card.Title icon={UserCircle}>My profile</Card.Title>
          </Card.Header>
          {profileSummary ? (
            <dl className="detail-list">
              <div className="detail-list__row">
                <dt>Location</dt>
                <dd>{profileSummary.location}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Work types</dt>
                <dd>{profileSummary.workTypes.join(', ')}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Daily wage</dt>
                <dd>₹{profileSummary.dailyWage}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Availability</dt>
                <dd>
                  <StatusBadge status={profileSummary.availability ? 'available' : 'unavailable'} />
                </dd>
              </div>
              <div className="detail-list__row">
                <dt>Rating</dt>
                <dd>
                  {profileSummary.rating != null
                    ? `★ ${profileSummary.rating.toFixed(1)} (${profileSummary.ratingCount})`
                    : 'No ratings yet'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="meta">Profile not found.</p>
          )}
        </Card>

        <div className="stack">
          <Card>
            <Card.Header>
              <Card.Title icon={ClipboardList}>Recent hiring requests</Card.Title>
            </Card.Header>
            {recentHiringRequests.length === 0 ? (
              <p className="meta">No hiring requests yet.</p>
            ) : (
              <ul className="mini-list">
                {recentHiringRequests.map((r) => (
                  <li key={r.id}>
                    <span>
                      <strong>{r.farmerName}</strong> · {r.workType}
                    </span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
            <Card.Footer>
              <Button to="/hiring" variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View all requests
              </Button>
            </Card.Footer>
          </Card>

          <ActionCard to="/learning" icon={BookOpen} title="Learning Hub" description="Browse practical farming guidance." />
        </div>
      </div>
    </Page>
  );
}

function Dashboard() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Admins have their own dashboard - the farmer/labourer summary endpoint doesn't apply to them.
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    getDashboard(token)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setStatus('ready');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(friendlyError(err, 'Your dashboard'));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (status === 'loading') {
    return (
      <Page>
        <PageHeader title={`${greeting()}, ${user.name.split(' ')[0]}`} description="Your farm at a glance." />
        <LoadingState label="Loading your dashboard..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        <PageHeader title={`${greeting()}, ${user.name.split(' ')[0]}`} description="Your farm at a glance." />
        <Card>
          <ErrorState title="Unable to load your dashboard" message={error} />
        </Card>
      </Page>
    );
  }

  return data.role === 'farmer' ? <FarmerDashboard data={data} /> : <LabourerDashboard data={data} />;
}

export default Dashboard;
