import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { MapPin, UserRound, History, Handshake, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getLabourerById } from '../services/labourerService';
import { createHiringRequest } from '../services/hiringService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { StatusBadge } from '../components/Badge';
import { RatingText } from '../components/LabourCard';
import EmptyState, { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { initials } from '../utils/format';

const BACK = { to: '/labourers', label: 'Back to Labour Marketplace' };

function LabourerDetail() {
  const { id } = useParams();
  const { hash } = useLocation();
  const { token } = useAuth();

  const [status, setStatus] = useState('loading');
  const [labourer, setLabourer] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ workDate: '', numberOfDays: 1, farmLocation: '', message: '' });
  const [workType, setWorkType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLabourerById(token, id)
      .then((d) => {
        if (cancelled) return;
        setLabourer(d.labourer);
        setWorkType(d.labourer.workTypes[0] || '');
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(friendlyError(err, 'This labourer'));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  // "Send hiring request" on a marketplace card links to #hire - bring the
  // form into view once the profile has rendered.
  useEffect(() => {
    if (status === 'ready' && hash === '#hire') {
      document.getElementById('hire')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status, hash]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await createHiringRequest(token, {
        labourerId: labourer.userId,
        workType,
        workDate: form.workDate,
        numberOfDays: Number(form.numberOfDays),
        farmLocation: form.farmLocation,
        message: form.message || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(friendlyError(err, 'This labourer'));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <Page>
        <PageHeader back={BACK} eyebrow="Labour Profile" pillar="labour" title="Loading profile..." />
        <LoadingState label="Loading labourer profile..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        <PageHeader back={BACK} eyebrow="Labour Profile" pillar="labour" title="Labourer profile" />
        <Card>
          <ErrorState
            title="Unable to load this labourer"
            message={error}
            action={
              <Button to="/labourers" variant="secondary">
                Back to marketplace
              </Button>
            }
          />
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        back={BACK}
        eyebrow="Labour Profile"
        pillar="labour"
        title={labourer.name}
        description={
          <>
            <span className="inline-meta">
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
              {labourer.location}
            </span>
            <StatusBadge status={labourer.availability ? 'available' : 'unavailable'} label={labourer.availability ? 'Available now' : 'Not currently available'} />
          </>
        }
        actions={
          !submitted && (
            <Button to={`/labourers/${id}#hire`} icon={Send}>
              Hire this worker
            </Button>
          )
        }
      />

      <div className="two-col">
        <Card>
          <div className="profile-overview__head">
            <span className="avatar avatar--lg" aria-hidden="true">
              {initials(labourer.name)}
            </span>
            <div>
              <Card.Title icon={UserRound}>Profile overview</Card.Title>
              <RatingText rating={labourer.rating} ratingCount={labourer.ratingCount} isDemoData={labourer.isDemoData} />
            </div>
          </div>
          <dl className="detail-list">
            <div className="detail-list__row">
              <dt>Daily wage</dt>
              <dd>₹{labourer.dailyWage} / day</dd>
            </div>
            <div className="detail-list__row">
              <dt>Experience</dt>
              <dd>{labourer.experienceYears} years</dd>
            </div>
            <div className="detail-list__row">
              <dt>Availability</dt>
              <dd>{labourer.availability ? 'Available now' : 'Not currently available'}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Work types</dt>
              <dd>
                <span className="chip-row chip-row--end">
                  {labourer.workTypes.map((w) => (
                    <span className="chip" key={w}>
                      {w}
                    </span>
                  ))}
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title icon={History}>Work history</Card.Title>
          </Card.Header>
          {labourer.workHistory?.length > 0 ? (
            <ol className="timeline">
              {labourer.workHistory.map((h, i) => (
                <li key={i} className="timeline__item">
                  <span className="timeline__year">{h.year || '—'}</span>
                  <span>{h.description}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No work history added yet" description="This labourer hasn't listed previous work." />
          )}
        </Card>
      </div>

      {labourer.description && (
        <Section title="About">
          <Card>
            <p className="prose">{labourer.description}</p>
          </Card>
        </Section>
      )}

      <Section id="hire" className="hire-section">
        <Card className="hire-card">
          <Card.Header>
            <Card.Title icon={Handshake}>Hire this worker</Card.Title>
            <Card.Description>
              Send {labourer.name.split(' ')[0]} a request with your work details. You can track it in Hiring Requests.
            </Card.Description>
          </Card.Header>

          {submitted ? (
            <div className="success-panel" role="status">
              <CheckCircle2 size={28} strokeWidth={2} aria-hidden="true" />
              <div>
                <strong>Request sent.</strong>
                <p>Track its status in My Hiring Requests.</p>
              </div>
              <Button to="/hiring">View my hiring requests</Button>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-grid form-grid--2">
                <div className="form-field">
                  <label htmlFor="workType">Work type</label>
                  <select id="workType" value={workType} onChange={(e) => setWorkType(e.target.value)} required>
                    {labourer.workTypes.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="workDate">Work start date</label>
                  <input id="workDate" name="workDate" type="date" required value={form.workDate} onChange={handleChange} />
                </div>
                <div className="form-field">
                  <label htmlFor="numberOfDays">Number of days</label>
                  <input
                    id="numberOfDays"
                    name="numberOfDays"
                    type="number"
                    min="1"
                    required
                    value={form.numberOfDays}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="farmLocation">Farm location</label>
                  <input id="farmLocation" name="farmLocation" required value={form.farmLocation} onChange={handleChange} />
                </div>
                <div className="form-field form-field--full">
                  <label htmlFor="message">Work requirement / message (optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="e.g. Harvesting 2 acres of paddy, starting early morning."
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {submitError && <p className="form-error">{submitError}</p>}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  <Send size={16} strokeWidth={2} aria-hidden="true" />
                  {submitting ? 'Sending...' : 'Send hiring request'}
                </button>
                <span className="meta">
                  Estimated wage: ₹{labourer.dailyWage}/day × {Number(form.numberOfDays) || 0} day
                  {Number(form.numberOfDays) === 1 ? '' : 's'}
                </span>
              </div>
            </form>
          )}
        </Card>
      </Section>
    </Page>
  );
}

export default LabourerDetail;
