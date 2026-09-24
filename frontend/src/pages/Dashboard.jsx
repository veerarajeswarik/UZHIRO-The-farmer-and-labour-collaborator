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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDashboard } from '../services/dashboardService';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Button from '../components/Button';
import { StatusBadge } from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

function currency(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80';

const QUICK_ACTIONS = [
  { label: 'Find Crops', to: '/crops', icon: Sprout },
  { label: 'Compare Crops', to: '/crops/compare', icon: ListChecks },
  { label: 'Estimate Profit', to: '/profit', icon: Calculator },
  { label: 'Find Labour', to: '/labourers', icon: Users },
  { label: 'Ask AI', to: '/assistant', icon: Bot },
];

function QuickActions() {
  return (
    <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
      {QUICK_ACTIONS.map((a) => (
        <Card as={Link} to={a.to} hover key={a.label} style={{ textAlign: 'center', textDecoration: 'none' }}>
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-100)',
              color: 'var(--color-primary-700)',
              margin: '0 auto var(--space-sm)',
            }}
          >
            <a.icon size={20} strokeWidth={2} />
          </span>
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{a.label}</div>
        </Card>
      ))}
    </div>
  );
}

function FarmerDashboard({ data }) {
  const { farmSummary, topCropRecommendation, financialSummary, upcomingTasks, weather, recentHiringRequests, learningRecommendations } =
    data;

  return (
    <>
      <PageHero
        compact
        image={HERO_IMAGE}
        eyebrow={`Season: ${data.season}`}
        title={<>Better decisions for a <em>greener</em> tomorrow.</>}
        description={`Welcome back, ${data.welcomeName}. Here's where your farm stands today.`}
      />

      <div className="container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 1 }}>
        <div className="grid-auto">
          <StatCard
            icon={MapPin}
            label="My Farm"
            value={farmSummary.landAreaAcres != null ? `${farmSummary.landAreaAcres} acres` : 'Not set'}
            meta={farmSummary.location}
          />
          <StatCard
            icon={Sprout}
            label="Top Crop Recommendation"
            value={topCropRecommendation ? topCropRecommendation.crop.name : 'Complete profile'}
            meta={topCropRecommendation ? `${topCropRecommendation.level} suitability - ${topCropRecommendation.score}/100` : 'to unlock'}
          />
          <StatCard
            icon={Wallet}
            label="Estimated Profit"
            value={financialSummary ? currency(financialSummary.estimatedProfit) : '—'}
            meta={financialSummary ? `for ${financialSummary.crop.name}` : 'Set land area first'}
          />
          <StatCard
            icon={ClipboardList}
            label="Upcoming Tasks"
            value={upcomingTasks.length}
            meta="on your farm planner"
          />
        </div>
      </div>

      <div className="section">
        <div className="container">
          <SectionHeader eyebrow="Get moving" title="Quick actions" />
          <QuickActions />
        </div>
      </div>

      <div className="section section--cream">
        <div className="container">
          <SectionHeader eyebrow="Recommended for you" title="Your top crop match" />
          {topCropRecommendation ? (
            <Card hover style={{ maxWidth: 520 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                <span className="crop-card__name">{topCropRecommendation.crop.name}</span>
                <span className={`badge badge-${topCropRecommendation.level.toLowerCase()}`}>{topCropRecommendation.level}</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 'var(--space-sm)' }}>
                <div className="progress-bar__fill" style={{ width: `${topCropRecommendation.score}%` }} />
              </div>
              <p className="form-hint" style={{ marginTop: 'var(--space-xs)' }}>Suitability: {topCropRecommendation.score}/100</p>
              <p style={{ marginTop: 'var(--space-sm)' }}>{topCropRecommendation.explanation}</p>
              <Button to={`/crops/${topCropRecommendation.crop.id}`} variant="secondary" size="sm" style={{ marginTop: 'var(--space-md)' }}>
                View crop <ArrowRight size={14} />
              </Button>
            </Card>
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
        </div>
      </div>

      <div className="section">
        <div className="container">
          <SectionHeader eyebrow="Stay ahead" title="Upcoming farm tasks" />
          {upcomingTasks.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No upcoming tasks" description="Add tasks in your farm planner to see them here." />
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {upcomingTasks.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md) var(--space-lg)',
                    borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{t.title}</span>
                  <span className="form-hint">
                    {new Date(t.dueDate).toLocaleDateString('en-IN')} · {t.type}
                  </span>
                </div>
              ))}
            </Card>
          )}
          <Button to="/planner" variant="ghost" size="sm" style={{ marginTop: 'var(--space-md)' }}>
            Open Farm Planner <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      <div className="section section--cream">
        <div className="container">
          <SectionHeader eyebrow="Recent activity" title="What's happening" />
          <div className="grid-2">
            <Card>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CloudSun size={18} /> Weather
              </h3>
              {weather ? (
                <>
                  <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginTop: 'var(--space-sm)' }}>
                    {Math.round(weather.temperatureC)}°C - {weather.description}
                  </p>
                  <p className="form-hint">{weather.topInsight}</p>
                  {weather.alertCount > 0 && (
                    <p className="form-error" style={{ marginTop: 'var(--space-sm)' }}>{weather.alertCount} weather alert(s)</p>
                  )}
                  <Button to="/weather" variant="ghost" size="sm" style={{ marginTop: 'var(--space-sm)' }}>
                    View full forecast <ArrowRight size={14} />
                  </Button>
                </>
              ) : (
                <p className="form-hint" style={{ marginTop: 'var(--space-sm)' }}>Weather is currently unavailable.</p>
              )}
            </Card>

            <Card>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} /> Recent labour requests
              </h3>
              {recentHiringRequests.length === 0 ? (
                <p className="form-hint" style={{ marginTop: 'var(--space-sm)' }}>No hiring requests yet.</p>
              ) : (
                <ul style={{ marginTop: 'var(--space-sm)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {recentHiringRequests.map((r) => (
                    <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                      <span>{r.labourerName} - {r.workType}</span>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
              <Button to="/hiring" variant="ghost" size="sm" style={{ marginTop: 'var(--space-sm)' }}>
                View all requests <ArrowRight size={14} />
              </Button>
            </Card>

            <Card>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={18} /> Learning recommendations
              </h3>
              <ul style={{ marginTop: 'var(--space-sm)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {learningRecommendations.map((a) => (
                  <li key={a.id}>
                    <Link to={`/learning/${a.id}`} style={{ fontWeight: 600 }}>{a.title}</Link>{' '}
                    <span className="form-hint">({a.category})</span>
                  </li>
                ))}
              </ul>
              <Button to="/learning" variant="ghost" size="sm" style={{ marginTop: 'var(--space-sm)' }}>
                Browse Learning Hub <ArrowRight size={14} />
              </Button>
            </Card>

            <Card>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Landmark size={18} /> Government schemes
              </h3>
              <p className="form-hint" style={{ marginTop: 'var(--space-sm)' }}>
                Discover financial support, insurance and irrigation programs for farmers.
              </p>
              <Button to="/schemes" variant="ghost" size="sm" style={{ marginTop: 'var(--space-sm)' }}>
                Browse schemes <ArrowRight size={14} />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function LabourerDashboard({ data }) {
  const { profileSummary, recentHiringRequests } = data;

  return (
    <>
      <PageHero
        compact
        image={HERO_IMAGE}
        eyebrow="Labour Marketplace"
        title={<>Welcome back, {data.welcomeName}.</>}
        description="Track your hiring requests and keep your profile up to date so farmers can find you."
      />

      <div className="section">
        <div className="container">
          <div className="grid-auto">
            <Card>
              <h2>My profile</h2>
              {profileSummary ? (
                <ul style={{ marginTop: 'var(--space-sm)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Location: {profileSummary.location}</li>
                  <li>Work types: {profileSummary.workTypes.join(', ')}</li>
                  <li>Daily wage: ₹{profileSummary.dailyWage}</li>
                  <li>Availability: {profileSummary.availability ? 'Available' : 'Not available'}</li>
                  <li>Rating: {profileSummary.rating != null ? `★ ${profileSummary.rating.toFixed(1)} (${profileSummary.ratingCount})` : 'No ratings yet'}</li>
                </ul>
              ) : (
                <p className="form-hint">Profile not found.</p>
              )}
              <Button to="/labourer/profile" variant="secondary" size="sm" style={{ marginTop: 'var(--space-md)' }}>
                Edit profile
              </Button>
            </Card>

            <Card>
              <h2>Recent hiring requests</h2>
              {recentHiringRequests.length === 0 ? (
                <p className="form-hint" style={{ marginTop: 'var(--space-sm)' }}>No hiring requests yet.</p>
              ) : (
                <ul style={{ marginTop: 'var(--space-sm)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {recentHiringRequests.map((r) => (
                    <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                      <span>{r.farmerName} - {r.workType}</span>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
              <Button to="/hiring" variant="secondary" size="sm" style={{ marginTop: 'var(--space-md)' }}>
                View all requests
              </Button>
            </Card>

            <Card>
              <h2>Learning Hub</h2>
              <p className="form-hint" style={{ marginTop: 'var(--space-sm)' }}>Browse general farming guidance and awareness content.</p>
              <Button to="/learning" variant="secondary" size="sm" style={{ marginTop: 'var(--space-md)' }}>
                Browse Learning Hub
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
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
          setError(err.message);
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
    return <LoadingState label="Loading your dashboard..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load your dashboard. {error}</p>
      </div>
    );
  }

  return data.role === 'farmer' ? <FarmerDashboard data={data} /> : <LabourerDashboard data={data} />;
}

export default Dashboard;
