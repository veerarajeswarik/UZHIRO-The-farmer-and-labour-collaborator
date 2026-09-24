import { Navigate } from 'react-router-dom';
import { Sprout, Calculator, Users, Bot, CloudSun, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const FEATURES = [
  {
    icon: Sprout,
    title: 'Smart crop selection',
    description: 'Get crop recommendations scored transparently against your soil, water and season - never a guess.',
  },
  {
    icon: Calculator,
    title: 'Cost & profit estimator',
    description: 'See expected investment, revenue and profit for a crop on your land before you commit.',
  },
  {
    icon: Users,
    title: 'Labour marketplace',
    description: 'Find and hire farm labour by location, work type and availability, with request tracking.',
  },
  {
    icon: Bot,
    title: 'AI farming assistant',
    description: 'Ask farming questions and get guidance grounded in your farm profile - always a starting point, never a guarantee.',
  },
  {
    icon: CloudSun,
    title: 'Weather & farm planner',
    description: 'Live weather with farming-focused insights, plus a task planner for planting, irrigation and harvest.',
  },
  {
    icon: BookOpen,
    title: 'Learning hub & schemes',
    description: 'General farming guidance and real government scheme information, with official sources linked.',
  },
];

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80';

function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <PageHero
        image={HERO_IMAGE}
        eyebrow="Smart Agriculture. Better Decisions."
        title={
          <>
            One platform for every <em>farming</em> decision.
          </>
        }
        description="UZHIRO helps farmers choose the right crops, estimate costs and profit, find labour, and get farming guidance - all backed by transparent data, not guesswork."
        actions={
          <>
            <Button to="/register" size="lg">
              Get started
              <ArrowRight size={16} strokeWidth={2} />
            </Button>
            <Button to="/login" variant="on-dark" size="lg">
              Log in
            </Button>
          </>
        }
        floating={
          <div className="glass-card">
            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Trusted by growers
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginTop: '0.25rem' }}>
              Data-driven farming, start to harvest
            </div>
          </div>
        }
      />

      <section className="section section--cream">
        <div className="container">
          <SectionHeader
            eyebrow="Why UZHIRO"
            title="Everything in one place"
            description="One connected workspace for crop decisions, finances, labour and farm operations."
            center
          />
          <div className="grid-auto">
            {FEATURES.map((f) => (
              <Card hover key={f.title}>
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
                    marginBottom: 'var(--space-md)',
                  }}
                >
                  <f.icon size={20} strokeWidth={2} />
                </span>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
