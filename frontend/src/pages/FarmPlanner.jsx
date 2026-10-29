import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarDays, Sprout, Check, Pencil, Trash2, Plus, Wand2, Sun, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  generateTasksFromCrop,
} from '../services/taskService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge, { StatusBadge } from '../components/Badge';
import SkeletonGrid from '../components/Skeleton';
import EmptyState, { ErrorState } from '../components/EmptyState';
import { formatDate } from '../utils/format';

// Display-only grouping of the loaded tasks (local calendar day).
const GROUPS = [
  { key: 'today', title: "Today's tasks", description: 'Due today.', icon: Sun },
  { key: 'overdue', title: 'Overdue', description: 'Past their due date and not yet completed.', icon: AlertTriangle },
  { key: 'upcoming', title: 'Upcoming tasks', description: 'Coming up next, soonest first.', icon: CalendarClock },
  { key: 'completed', title: 'Completed', description: 'Done - nice work.', icon: CheckCircle2 },
];

function dayKey(d) {
  return new Date(d).toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
}

function groupTasks(tasks) {
  const today = dayKey(new Date());
  const byDate = (a, b) => new Date(a.dueDate) - new Date(b.dueDate);
  const g = { today: [], overdue: [], upcoming: [], completed: [] };
  tasks.forEach((t) => {
    if (t.status === 'Completed') g.completed.push(t);
    else if (dayKey(t.dueDate) === today) g.today.push(t);
    else if (dayKey(t.dueDate) < today) g.overdue.push(t);
    else g.upcoming.push(t);
  });
  g.today.sort(byDate);
  g.overdue.sort(byDate);
  g.upcoming.sort(byDate);
  g.completed.sort((a, b) => byDate(b, a));
  return g;
}

const TASK_TYPES = ['Planting', 'Irrigation', 'Fertilizer', 'Pest Monitoring', 'Harvest', 'General'];

const emptyNewTask = { title: '', type: 'General', dueDate: '', notes: '', cropId: '' };

function FarmPlanner() {
  const { token } = useAuth();

  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ status: '', type: '' });

  const [newTask, setNewTask] = useState(emptyNewTask);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [generateForm, setGenerateForm] = useState({ cropId: '', plantingDate: '' });
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generateNote, setGenerateNote] = useState('');

  function load() {
    setStatus('loading');
    getTasks(token, filters)
      .then((d) => {
        setTasks(d.tasks);
        setStatus('ready');
      })
      .catch((err) => {
        setError(friendlyError(err, 'Your tasks'));
        setStatus('error');
      });
  }

  useEffect(() => {
    getCrops().then((d) => setCrops(d.crops)).catch(() => setCrops([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [token, JSON.stringify(filters)]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await createTask(token, {
        title: newTask.title,
        type: newTask.type,
        dueDate: newTask.dueDate,
        notes: newTask.notes || undefined,
        cropId: newTask.cropId || undefined,
      });
      setNewTask(emptyNewTask);
      load();
    } catch (err) {
      setCreateError(friendlyError(err, 'This task'));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      type: task.type,
      dueDate: task.dueDate.slice(0, 10),
      notes: task.notes,
    });
  }

  async function saveEdit(id) {
    try {
      await updateTask(token, id, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(friendlyError(err, 'This task'));
    }
  }

  async function handleComplete(id) {
    await completeTask(token, id);
    load();
  }

  async function handleDelete(id) {
    await deleteTask(token, id);
    load();
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerateError('');
    setGenerateNote('');
    setGenerating(true);
    try {
      const data = await generateTasksFromCrop(token, generateForm);
      setGenerateNote(`Created ${data.count} tasks. ${data.disclaimer}`);
      load();
    } catch (err) {
      setGenerateError(friendlyError(err, 'This crop'));
    } finally {
      setGenerating(false);
    }
  }

  function renderTask(t, group) {
    if (editingId === t.id) {
      return (
        <Card className="item-card task-card" key={t.id}>
          <div className="form">
            <div className="form-field">
              <label htmlFor={`edit-title-${t.id}`}>Title</label>
              <input id={`edit-title-${t.id}`} value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-grid form-grid--2">
              <div className="form-field">
                <label htmlFor={`edit-type-${t.id}`}>Type</label>
                <select id={`edit-type-${t.id}`} value={editForm.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}>
                  {TASK_TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {ty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor={`edit-date-${t.id}`}>Due date</label>
                <input
                  id={`edit-date-${t.id}`}
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor={`edit-notes-${t.id}`}>Notes</label>
              <textarea
                id={`edit-notes-${t.id}`}
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => saveEdit(t.id)}>
                Save
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className={`item-card task-card task-card--${group}`} key={t.id}>
        <div className="item-card__header">
          <h3 className="item-card__title">{t.title}</h3>
          {group === 'overdue' ? <Badge variant="danger">Overdue</Badge> : <StatusBadge status={t.status} />}
        </div>
        <div className="item-card__meta">
          <span>
            <CalendarDays size={14} strokeWidth={2} aria-hidden="true" /> {formatDate(t.dueDate)}
          </span>
          <span className="chip">{t.type}</span>
          {t.crop && (
            <span>
              <Sprout size={14} strokeWidth={2} aria-hidden="true" /> {t.crop.name}
            </span>
          )}
        </div>
        {t.notes && <p className="item-card__body">{t.notes}</p>}
        {t.isAutoGenerated && <span className="meta">Auto-generated from crop schedule</span>}
        <div className="item-card__footer">
          {t.status !== 'Completed' && (
            <Button size="sm" icon={Check} onClick={() => handleComplete(t.id)}>
              Mark complete
            </Button>
          )}
          <Button size="sm" variant="secondary" icon={Pencil} onClick={() => startEdit(t)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(t.id)} aria-label={`Delete ${t.title}`}>
            Delete
          </Button>
        </div>
      </Card>
    );
  }

  const groups = groupTasks(tasks);

  return (
    <Page>
      <PageHeader
        eyebrow="Farm Intelligence"
        pillar="farm"
        title="Farm Planner"
        description="Know what to do on your farm, and when - planting, irrigation, fertilizer, pest and harvest tasks."
        actions={
          <a href="#plan" className="btn btn-primary">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Add a task
          </a>
        }
      />

      <div className="planner-summary">
        <div className="planner-summary__item planner-summary__item--today">
          <strong>{groups.today.length}</strong>
          <span>Due today</span>
        </div>
        <div className="planner-summary__item planner-summary__item--overdue">
          <strong>{groups.overdue.length}</strong>
          <span>Overdue</span>
        </div>
        <div className="planner-summary__item">
          <strong>{groups.upcoming.length}</strong>
          <span>Upcoming</span>
        </div>
        <div className="planner-summary__item">
          <strong>{groups.completed.length}</strong>
          <span>Completed</span>
        </div>
        <div className="planner-summary__filters">
          <label className="visually-hidden" htmlFor="filterStatus">
            Filter by status
          </label>
          <select id="filterStatus" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <label className="visually-hidden" htmlFor="filterType">
            Filter by type
          </label>
          <select id="filterType" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">All types</option>
            {TASK_TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {ty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === 'loading' && <SkeletonGrid count={3} label="Loading tasks..." />}
      {status === 'error' && (
        <Card>
          <ErrorState title="Unable to load tasks" message={error} />
        </Card>
      )}

      {status === 'ready' &&
        (tasks.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarCheck}
              title="No farm tasks"
              description="Add a task below, or generate a schedule from a crop."
              action={
                <a href="#plan" className="btn btn-primary">
                  Plan a task
                </a>
              }
            />
          </Card>
        ) : (
          GROUPS.map(({ key, title, description, icon: Icon }) =>
            groups[key].length === 0 ? null : (
              <Section
                key={key}
                title={
                  <span className="inline-meta">
                    <Icon size={20} strokeWidth={2} aria-hidden="true" /> {title} · {groups[key].length}
                  </span>
                }
                description={description}
              >
                <div className="item-grid">{groups[key].map((t) => renderTask(t, key))}</div>
              </Section>
            )
          )
        ))}

      <Section id="plan" title="Plan new work">
        <div className="two-col">
          <Card>
            <form className="form" onSubmit={handleCreate}>
              <Card.Header>
                <Card.Title icon={Plus}>Add a task</Card.Title>
              </Card.Header>
              <div className="form-field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                />
              </div>
              <div className="form-grid form-grid--2">
                <div className="form-field">
                  <label htmlFor="type">Type</label>
                  <select id="type" value={newTask.type} onChange={(e) => setNewTask((t) => ({ ...t, type: e.target.value }))}>
                    {TASK_TYPES.map((ty) => (
                      <option key={ty} value={ty}>
                        {ty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="dueDate">Due date</label>
                  <input
                    id="dueDate"
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask((t) => ({ ...t, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="cropId">Related crop (optional)</label>
                <select id="cropId" value={newTask.cropId} onChange={(e) => setNewTask((t) => ({ ...t, cropId: e.target.value }))}>
                  <option value="">None</option>
                  {crops.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea id="notes" rows={2} value={newTask.notes} onChange={(e) => setNewTask((t) => ({ ...t, notes: e.target.value }))} />
              </div>
              {createError && <p className="form-error">{createError}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  <Plus size={16} strokeWidth={2} aria-hidden="true" />
                  {creating ? 'Adding...' : 'Add task'}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <form className="form" onSubmit={handleGenerate}>
              <Card.Header>
                <Card.Title icon={Wand2}>Generate tasks from a crop</Card.Title>
                <Card.Description>Creates one task per cultivation stage, spaced across the crop&apos;s typical duration.</Card.Description>
              </Card.Header>
              <div className="form-field">
                <label htmlFor="genCrop">Crop</label>
                <select
                  id="genCrop"
                  required
                  value={generateForm.cropId}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, cropId: e.target.value }))}
                >
                  <option value="">Select a crop</option>
                  {crops.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="plantingDate">Planting date</label>
                <input
                  id="plantingDate"
                  type="date"
                  required
                  value={generateForm.plantingDate}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, plantingDate: e.target.value }))}
                />
              </div>
              {generateError && <p className="form-error">{generateError}</p>}
              {generateNote && <p className="form-success">{generateNote}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-secondary" disabled={generating}>
                  <Wand2 size={16} strokeWidth={2} aria-hidden="true" />
                  {generating ? 'Generating...' : 'Generate tasks'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </Page>
  );
}

export default FarmPlanner;
