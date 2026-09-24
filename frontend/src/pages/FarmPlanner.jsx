import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
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
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

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
        setError(err.message);
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
      setCreateError(err.message);
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
      setError(err.message);
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
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Farm Planner"
        title="Track every farm task"
        description="Plan planting, irrigation, fertilizer, pest and harvest tasks for your farm."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <div className="grid-2">
        <div className="card">
          <h2>Add a task</h2>
          <form className="form" style={{ maxWidth: '100%', marginTop: 'var(--space-md)' }} onSubmit={handleCreate}>
            <div className="form-field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                required
                value={newTask.title}
                onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
              />
            </div>
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
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Adding...' : 'Add task'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Generate tasks from a crop</h2>
          <p className="form-hint">Creates one task per cultivation stage, spaced across the crop's typical duration.</p>
          <form className="form" style={{ maxWidth: '100%', marginTop: 'var(--space-md)' }} onSubmit={handleGenerate}>
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
            <button type="submit" className="btn btn-secondary" disabled={generating}>
              {generating ? 'Generating...' : 'Generate tasks'}
            </button>
          </form>
        </div>
      </div>

      <div className="crop-toolbar" style={{ marginTop: 'var(--space-xl)' }}>
        <h2 style={{ margin: 0 }}>My tasks</h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">All types</option>
            {TASK_TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {ty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === 'loading' && <LoadingState label="Loading tasks..." />}
      {status === 'error' && <p className="form-error">Unable to load tasks. {error}</p>}

      {status === 'ready' && (
        <>
          {tasks.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No tasks yet"
              description="Add one above, or generate a schedule from a crop."
            />
          ) : (
            <div className="crop-grid" style={{ marginTop: 'var(--space-md)' }}>
              {tasks.map((t) => (
                <div className="card card-hover crop-card" key={t.id}>
                  {editingId === t.id ? (
                    <>
                      <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                      <select value={editForm.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}>
                        {TASK_TYPES.map((ty) => (
                          <option key={ty} value={ty}>
                            {ty}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                      />
                      <textarea
                        rows={2}
                        value={editForm.notes}
                        onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                      />
                      <div className="crop-card__footer">
                        <button type="button" className="btn btn-primary" onClick={() => saveEdit(t.id)}>
                          Save
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="crop-card__header">
                        <span className="crop-card__name">{t.title}</span>
                        <span className={t.status === 'Completed' ? 'badge badge-high' : 'badge badge-medium'}>{t.status}</span>
                      </div>
                      <p className="crop-card__score">
                        {t.type} · Due {new Date(t.dueDate).toLocaleDateString('en-IN')}
                        {t.crop ? ` · ${t.crop.name}` : ''}
                      </p>
                      {t.notes && <p className="crop-card__explanation">{t.notes}</p>}
                      {t.isAutoGenerated && <p className="form-hint">Auto-generated</p>}
                      <div className="crop-card__footer" style={{ gap: 'var(--space-sm)' }}>
                        {t.status !== 'Completed' && (
                          <button type="button" className="btn btn-primary" onClick={() => handleComplete(t.id)}>
                            Mark complete
                          </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={() => startEdit(t)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => handleDelete(t.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

export default FarmPlanner;
