import { useEffect, useState } from 'react';
import LoadingState from '../../components/LoadingState';
import { ErrorState } from '../../components/EmptyState';
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

      <div className="crop-toolbar">
        <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
          <option value="">All roles</option>
          <option value="farmer">Farmer</option>
          <option value="labourer">Labourer</option>
          <option value="admin">Admin</option>
        </select>
        <input placeholder="Search name/email/phone" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      {status === 'loading' && <LoadingState label="Loading users..." />}
      {status === 'error' && <ErrorState title="Unable to load users" message={error} />}

      {status === 'ready' && (
        <div className="table-wrap admin-table-wrap">
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
                    <span className={u.isActive ? 'badge badge--success' : 'badge badge--danger'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="table-actions">
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
