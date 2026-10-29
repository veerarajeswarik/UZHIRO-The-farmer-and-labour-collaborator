import { useEffect, useRef, useState } from 'react';
import { Send, Bot, Sparkles, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../services/aiService';
import { friendlyError } from '../services/errors';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const SUGGESTIONS = [
  'What should I plant?',
  'How much profit can I expect?',
  'Which crop suits my farm?',
  'What farming task should I do next?',
  'How can I improve my crop?',
];

function chatError(err) {
  if (!err?.status || err.status >= 500) {
    console.error(err);
    return "The assistant couldn't answer right now. Please try again in a moment.";
  }
  return friendlyError(err, 'The assistant');
}

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
    // Scroll within the chat panel only ('nearest' avoids yanking the whole page).
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      setError(chatError(err));
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
      setError(friendlyError(err, 'Your chat history'));
    }
  }

  const contextLabels = lastContextUsed
    ? Object.entries(lastContextUsed)
        .filter(([, v]) => v)
        .map(([k]) => k)
    : [];

  return (
    <Page>
      <PageHeader
        eyebrow="Tools · Farming guidance"
        pillar="neutral"
        title="UZHIRO AI Assistant"
        description="Your farming support companion. Ask about crops, costs, pests, fertilizer or what to do next. Answers are AI-generated guidance - for high-stakes decisions, consult your local agricultural extension officer."
      />

      <div className="chat-layout">
        <Card className="chat-card">
          <div className="chat-card__messages" aria-live="polite">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <span className="icon-tile icon-tile--lg" aria-hidden="true">
                  <Bot size={26} strokeWidth={2} />
                </span>
                <h2 className="card__title">How can I help on your farm today?</h2>
                <p className="meta">Pick a question to start, or type your own below.</p>
                <div className="chat-prompts">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" className="chat-prompt" onClick={() => setInput(s)}>
                      <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`chat-row chat-row--${m.role}`}>
                  {m.role === 'assistant' && (
                    <span className="chat-avatar" aria-hidden="true">
                      <Bot size={16} strokeWidth={2} />
                    </span>
                  )}
                  <div className={`chat-bubble chat-bubble--${m.role}`}>
                    <span className="visually-hidden">{m.role === 'user' ? 'You said:' : 'UZHIRO AI said:'}</span>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="chat-row chat-row--assistant">
                <span className="chat-avatar" aria-hidden="true">
                  <Bot size={16} strokeWidth={2} />
                </span>
                <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p className="form-error chat-card__error">{error}</p>}

          <form onSubmit={handleSend} className="chat-composer">
            <label htmlFor="chat-input" className="visually-hidden">
              Your question
            </label>
            <input
              id="chat-input"
              placeholder="Ask anything about your farm..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
              <Send size={16} strokeWidth={2} aria-hidden="true" />
              {sending ? 'Sending...' : 'Ask AI'}
            </button>
          </form>
        </Card>

        <aside className="stack chat-side">
          <Card>
            <Card.Header>
              <Card.Title icon={SlidersHorizontal}>Answer settings</Card.Title>
            </Card.Header>
            <div className="form">
              <div className="form-field">
                <label htmlFor="cropId">Ask about a specific crop</label>
                <select id="cropId" value={cropId} onChange={(e) => setCropId(e.target.value)}>
                  <option value="">None</option>
                  {crops.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="form-check">
                <input type="checkbox" checked={includeWeather} onChange={(e) => setIncludeWeather(e.target.checked)} />
                Include current weather
              </label>
              <label className="form-check">
                <input type="checkbox" checked={saveHistory} onChange={(e) => setSaveHistory(e.target.checked)} />
                Save my chat history
              </label>
              {messages.length > 0 && (
                <div>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={handleClearHistory}>
                    Clear history
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {messages.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title icon={Sparkles}>Try asking</Card.Title>
              </Card.Header>
              <div className="chat-prompts chat-prompts--stacked">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chat-prompt" onClick={() => setInput(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {(contextLabels.length > 0 || lastDisclaimer) && (
            <Card>
              {contextLabels.length > 0 && <p className="meta">Context used in the last answer: {contextLabels.join(', ')}.</p>}
              {lastDisclaimer && <p className="form-hint">{lastDisclaimer}</p>}
            </Card>
          )}
        </aside>
      </div>
    </Page>
  );
}

export default AiAssistant;
