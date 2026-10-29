import { Navigate } from 'react-router-dom';
import { Sprout, Calculator, Users, Bot, CalendarCheck, ArrowRight, Brain, Handshake, UserRound, ClipboardList, Landmark } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';

// The two UZHIRO pillars - how farmers make better decisions and get work done.
const PILLARS = [
  {
    key: 'farm',
    label: 'Farm Intelligence',
    icon: Brain,
    lead: 'Decide what to grow, what it will cost, and what to do next.',
    features: [
      { icon: Sprout, title: 'Crop selection & comparison', description: 'Crops scored transparently against your soil, water and season.' },
      { icon: Calculator, title: 'Cost & profit estimator', description: 'Expected investment, revenue and profit before you commit.' },
      { icon: CalendarCheck, title: 'Farm planner & weather', description: 'Know what to do and when, with farming-focused weather insights.' },
      { icon: Bot, title: 'AI assistant & learning', description: 'Practical farming guidance grounded in your farm profile.' },
    ],
  },
  {
    key: 'labour',
    label: 'Labour Connection',
    icon: Handshake,
    lead: 'Find reliable agricultural workers when you need them - no more phone-call chains.',
    features: [
      { icon: Users, title: 'Labour marketplace', description: 'Search by location, work type, availability, experience and wage.' },
      { icon: UserRound, title: 'Worker profiles', description: 'See experience, work history and ratings where available.' },
      { icon: ClipboardList, title: 'Hiring requests', description: 'Send requests and track them from pending to completed.' },
    ],
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
            Better farm decisions. <em>Reliable</em> farm labour.
          </>
        }
        description="UZHIRO helps farmers make better farming decisions and connect with agricultural labourers when they need them."
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
            <div className="glass-card__label">Supporting SDG 2 &amp; SDG 8</div>
            <div className="glass-card__title">Zero Hunger · Decent Work and Economic Growth</div>
          </div>
        }
      />

      <section className="section section--cream">
        <div className="container">
          <SectionHeader
            eyebrow="How UZHIRO helps"
            title="Two things every farm needs"
            description="Practical guidance for your farming decisions, and a dependable way to find labour at the right time."
            center
          />
          <div className="pillar-grid pillar-grid--even">
            {PILLARS.map((p) => (
              <div key={p.key} className={`pillar-panel pillar-panel--${p.key}`}>
                <div className="pillar-panel__head">
                  <span className={`icon-tile${p.key === 'labour' ? ' icon-tile--labour' : ''}`} aria-hidden="true">
                    <p.icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <span className={`eyebrow eyebrow--${p.key}`}>{p.label}</span>
                    <p>{p.lead}</p>
                  </div>
                </div>
                <ul className="feature-list">
                  {p.features.map((f) => (
                    <li key={f.title}>
                      <span className={`icon-tile${p.key === 'labour' ? ' icon-tile--labour' : ''}`} aria-hidden="true">
                        <f.icon size={18} strokeWidth={2} />
                      </span>
                      <span>
                        <strong>{f.title}</strong>
                        <span className="meta">{f.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="landing-cta">
            <span className="icon-tile" aria-hidden="true">
              <Landmark size={20} strokeWidth={2} />
            </span>
            <p>
              Plus a <strong>Learning Hub</strong> and <strong>Government Schemes</strong> guide, with official sources linked.
            </p>
            <Button to="/register" icon={ArrowRight} iconPosition="right">
              Create your free account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
