import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../services/aiService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const SUGGESTIONS = [
  'What should I plant this season?',
  'How can I improve my yield?',
  'How much will this crop cost?',
  'How should I manage irrigation?',
];

function AiAssistant() {
  const { token } = useAuth();
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState('');
  const [includeWeather, setIncludeWeather] = useState(false);
  const [saveHistory, setSaveHistory] = useState(false);

  const [messages, setMessages] = useState([]); // [{role, content}]
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [lastDisclaimer, setLastDisclaimer] = useState('');
  const [lastContextUsed, setLastContextUsed] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    getCrops().then((d) => setCrops(d.crops)).catch(() => setCrops([]));
    getChatHistory(token)
      .then((d) => {
        if (d.messages?.length) {
          setMessages(d.messages.map((m) => ({ role: m.role, content: m.content })));
          setSaveHistory(true); // history exists, so consent was previously given
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setError('');
    const userMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const data = await sendChatMessage(token, {
        message: userMessage.content,
        history: messages.slice(-20),
        cropId: cropId || undefined,
        includeWeather,
        saveHistory,
      });
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
      setLastDisclaimer(data.disclaimer);
      setLastContextUsed(data.contextUsed);
    } catch (err) {
      setError(err.message);
      setMessages(nextMessages); // keep the user's message visible even on failure
    } finally {
      setSending(false);
    }
  }

  async function handleClearHistory() {
    try {
      await clearChatHistory(token);
      setMessages([]);
      setSaveHistory(false);
    } catch (err) {
      setError(err.message);
    }
  }

  const contextLabels = lastContextUsed
    ? Object.entries(lastContextUsed)
        .filter(([, v]) => v)
        .map(([k]) => k)
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="AI Assistant"
        title="Your smart farming assistant"
        description="Ask about crop choices, pests, fertilizer or general farming questions. Answers are AI-generated guidance, not a guarantee - for high-stakes decisions, consult a local agricultural extension officer."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <Card style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-field" style={{ minWidth: 200 }}>
          <label htmlFor="cropId">Ask about a specific crop (optional)</label>
          <select id="cropId" value={cropId} onChange={(e) => setCropId(e.target.value)}>
            <option value="">None</option>
            {crops.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <input type="checkbox" checked={includeWeather} onChange={(e) => setIncludeWeather(e.target.checked)} />
          Include current weather
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <input type="checkbox" checked={saveHistory} onChange={(e) => setSaveHistory(e.target.checked)} />
          Save my chat history
        </label>
        {messages.length > 0 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearHistory}>
            Clear history
          </button>
        )}
      </Card>

      {messages.length === 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="filter-chip" onClick={() => setInput(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <Card style={{ marginTop: 'var(--space-lg)', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 480 }}>
          {messages.length === 0 && <p className="form-hint">Ask your first question below.</p>}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 'var(--space-md)',
                textAlign: m.role === 'user' ? 'right' : 'left',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: '80%',
                  padding: '0.6rem 1rem',
                  borderRadius: m.role === 'user' ? '1.1rem 1.1rem 0.2rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.2rem',
                  background: m.role === 'user' ? 'var(--color-primary-700)' : 'var(--color-primary-50)',
                  color: m.role === 'user' ? 'var(--color-text-inverse)' : 'var(--color-text)',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                }}
              >
                {m.content}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <input
            style={{ flex: 1 }}
            placeholder="Ask anything about your farm..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
            <Send size={16} strokeWidth={2} />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </Card>

      {contextLabels.length > 0 && (
        <p className="form-hint" style={{ marginTop: 'var(--space-md)' }}>
          Context used in the last answer: {contextLabels.join(', ')}.
        </p>
      )}

      {lastDisclaimer && (
        <p className="form-hint" style={{ marginTop: 'var(--space-xs)' }}>
          {lastDisclaimer}
        </p>
      )}
      </div>
    </div>
  );
}

export default AiAssistant;
