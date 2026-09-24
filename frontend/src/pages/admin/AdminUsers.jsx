import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listUsers, deactivateUser, activateUser, deleteUser } from '../../services/adminService';

function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [filters, setFilters] = useState({ role: '', q: '' });
  const [status, setStatus] = useState('loading');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  function load() {
    setStatus('loading');
    listUsers(token, filters)
      .then((d) => {
        setUsers(d.users);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token, JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggleActive(u) {
    setActionError('');
    try {
      if (u.isActive) await deactivateUser(token, u.id);
      else await activateUser(token, u.id);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete(u) {
    setActionError('');
    try {
      await deleteUser(token, u.id);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <h2>Users</h2>

      <div className="crop-toolbar" style={{ marginTop: 'var(--space-md)' }}>
        <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
          <option value="">All roles</option>
          <option value="farmer">Farmer</option>
          <option value="labourer">Labourer</option>
          <option value="admin">Admin</option>
        </select>
        <input placeholder="Search name/email/phone" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      {status === 'loading' && <p>Loading users...</p>}
      {status === 'error' && <p className="form-error">Unable to load users. {error}</p>}

      {status === 'ready' && (
        <div className="compare-table-wrap" style={{ marginTop: 'var(--space-md)' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.location}</td>
                  <td>
                    <span className={u.isActive ? 'badge badge-high' : 'badge badge-low'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    <button type="button" className="btn btn-secondary" disabled={u.id === currentUser.id} onClick={() => handleToggleActive(u)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="btn btn-secondary" disabled={u.id === currentUser.id} onClick={() => handleDelete(u)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminUsers;
