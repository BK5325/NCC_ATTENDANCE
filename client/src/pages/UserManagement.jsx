import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  UserCheck, UserX, Shield, UserPlus, CheckCircle, AlertCircle,
  X, Trash2, Pencil, Eye, EyeOff, RefreshCw,
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const roleBadge = (role) => {
  if (role === 'admin') return 'bg-red-100 text-red-700 border border-red-200';
  if (role === 'staff') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-gray-100 text-gray-600 border border-gray-200';
};

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] focus:border-transparent bg-white transition-all';

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Toast = ({ type, msg, onDismiss }) => {
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div className={`flex items-center gap-2 rounded-lg p-3 text-sm mb-4 ${ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
      {ok ? <CheckCircle size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
      <span className="flex-1">{msg}</span>
      {onDismiss && <button onClick={onDismiss} className="ml-auto opacity-60 hover:opacity-100 font-bold text-xs">✕</button>}
    </div>
  );
};

/* ─── Edit User Modal ─────────────────────────────────────────────────── */
const EditUserModal = ({ editTarget, token, onClose, onSaved }) => {
  const [name, setName] = useState(editTarget.name || '');
  const [email, setEmail] = useState(editTarget.email || '');
  const [username, setUsername] = useState(editTarget.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!username.trim()) { setError('Username is required.'); return; }
    if (passwordTouched && newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (passwordTouched && newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
      };
      if (passwordTouched && newPassword.trim()) payload.password = newPassword.trim();

      await axios.put(`/api/users/${editTarget._id}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Edit User</h3>
            <p className="text-xs text-gray-400">@{editTarget.username} · {editTarget.role}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {error && <Toast type="error" msg={error} onDismiss={() => setError('')} />}

        <form onSubmit={handleSave} className="space-y-4" autoComplete="off">
          <input type="text" style={{ display: 'none' }} autoComplete="username" readOnly />
          <input type="password" style={{ display: 'none' }} autoComplete="new-password" readOnly />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className={inputClass} value={name} autoComplete="name"
                onChange={e => setName(e.target.value)} placeholder="Full Name" />
            </Field>
            <Field label="Username" required>
              <input className={inputClass} value={username} autoComplete="off"
                onChange={e => setUsername(e.target.value)} placeholder="username" />
            </Field>
          </div>

          <Field label="Email" required>
            <input type="email" className={inputClass} value={email} autoComplete="email"
              onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </Field>

          <div className="rounded-lg border border-dashed border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              🔒 Change Password — leave blank to keep current
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New Password">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputClass + ' pr-10'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordTouched(true); }}
                    placeholder="Min 6 chars"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordTouched(true); }}
                  placeholder="Repeat password"
                />
              </Field>
            </div>
            {passwordTouched && newPassword && confirmPassword && (
              <p className={`text-xs mt-2 font-medium ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] disabled:opacity-60 transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Confirm Modal ────────────────────────────────────────────────────── */
const ConfirmModal = ({ modal, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 mx-auto
        bg-yellow-100 text-yellow-600">
        <AlertCircle size={20} />
      </div>
      <h3 className="font-bold text-gray-900 mb-2 text-center">Confirm Action</h3>
      <p className="text-sm text-gray-600 mb-6 text-center">{modal.label}</p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors ${
            modal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2c5530] hover:bg-[#1b381e]'
          }`}
        >
          Confirm
        </button>
        <button onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────── */
const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Create User modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', password: '', role: 'user' });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);

  // Edit user modal state
  const [editTarget, setEditTarget] = useState(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null);

  /* ── Fetch all users ── */
  const fetchUsers = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(data);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ── Role change ── */
  const handleRoleChange = async (userId, newRole) => {
    setActionError(''); setActionSuccess('');
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setActionSuccess(`Role updated to "${newRole}" successfully.`);
      fetchUsers();
      setConfirmModal(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update role. Please try again.');
      setConfirmModal(null);
    }
  };

  /* ── Status change ── */
  const handleStatusChange = async (userId, newStatus) => {
    setActionError(''); setActionSuccess('');
    try {
      await axios.put(`/api/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setActionSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
      fetchUsers();
      setConfirmModal(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status. Please try again.');
      setConfirmModal(null);
    }
  };

  /* ── Delete user ── */
  const handleDeleteUser = async (userId) => {
    setActionError(''); setActionSuccess('');
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setActionSuccess('User deleted successfully.');
      fetchUsers();
      setConfirmModal(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete user. Please try again.');
      setConfirmModal(null);
    }
  };

  /* ── Create user (single-step with role assigned by server based on admin token) ── */
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError(''); setAddSuccess('');

    if (!newUser.name.trim()) { setAddError('Full name is required.'); return; }
    if (!newUser.email.trim()) { setAddError('Email is required.'); return; }
    if (!newUser.username.trim()) { setAddError('Username is required.'); return; }
    if (!newUser.password.trim()) { setAddError('Password is required.'); return; }
    if (newUser.password.length < 6) { setAddError('Password must be at least 6 characters.'); return; }

    setAddLoading(true);
    try {
      // Send Authorization header so optionalProtect populates req.user
      // → server assigns the selected role directly in one step
      await axios.post('/api/auth/register', {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        username: newUser.username.trim(),
        password: newUser.password,
        role: newUser.role,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setAddSuccess(`User "${newUser.name}" created as ${newUser.role} successfully!`);
      setNewUser({ name: '', email: '', username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  /* ── Confirm modal dispatcher ── */
  const handleConfirm = () => {
    if (!confirmModal) return;
    const { type, userId, value } = confirmModal;
    if (type === 'role') handleRoleChange(userId, value);
    else if (type === 'status') handleStatusChange(userId, value);
    else if (type === 'delete') handleDeleteUser(userId);
  };

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="p-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center shadow-sm">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage users, staff, and admin roles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} title="Refresh"
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { setShowAddModal(true); setAddError(''); setAddSuccess(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] transition-colors shadow-sm">
            <UserPlus size={16} /> Create User / Staff
          </button>
        </div>
      </div>

      {/* ── Action feedback ── */}
      <Toast type="success" msg={actionSuccess} onDismiss={() => setActionSuccess('')} />
      <Toast type="error" msg={actionError} onDismiss={() => setActionError('')} />

      {/* ── Fetch error ── */}
      {fetchError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm flex-1">{fetchError}</span>
          <button onClick={fetchUsers}
            className="text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Name', 'Email', 'Username', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="animate-spin w-5 h-5 border-2 border-[#2c5530] border-t-transparent rounded-full" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No users found.</td>
                </tr>
              ) : users.map((u, idx) => (
                <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u._id === user._id ? 'bg-green-50/60' : ''}`}>
                  <td className="px-4 py-3 text-gray-400 text-xs font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                    {u.name}
                    {u._id === user._id && (
                      <span className="ml-1.5 text-xs text-green-600 font-normal bg-green-100 px-1.5 py-0.5 rounded-full">You</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-gray-700 text-xs">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${roleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.status === 'active'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Edit — available for all users */}
                      <button
                        onClick={() => setEditTarget(u)}
                        className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md hover:bg-indigo-100 font-medium transition-colors flex items-center gap-1"
                      >
                        <Pencil size={10} /> Edit
                      </button>

                      {/* Role / Status / Delete — only for other users */}
                      {u._id !== user._id && (
                        <>
                          {u.role !== 'staff' && (
                            <button
                              onClick={() => setConfirmModal({ type: 'role', userId: u._id, value: 'staff', label: `Promote "${u.name}" to Staff?` })}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md hover:bg-blue-100 font-medium transition-colors"
                            >→ Staff</button>
                          )}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => setConfirmModal({ type: 'role', userId: u._id, value: 'admin', label: `Promote "${u.name}" to Admin? This grants full system access.` })}
                              className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md hover:bg-red-100 font-medium transition-colors"
                            >→ Admin</button>
                          )}
                          {u.role !== 'user' && (
                            <button
                              onClick={() => setConfirmModal({ type: 'role', userId: u._id, value: 'user', label: `Demote "${u.name}" to Cadet (User)?` })}
                              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 font-medium transition-colors"
                            >→ Cadet</button>
                          )}
                          {u.status === 'active' ? (
                            <button
                              onClick={() => setConfirmModal({ type: 'status', userId: u._id, value: 'inactive', label: `Deactivate "${u.name}"? They won't be able to log in.` })}
                              className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-md hover:bg-yellow-100 font-medium transition-colors flex items-center gap-1"
                            ><UserX size={10} /> Deactivate</button>
                          ) : (
                            <button
                              onClick={() => setConfirmModal({ type: 'status', userId: u._id, value: 'active', label: `Activate "${u.name}"?` })}
                              className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md hover:bg-green-100 font-medium transition-colors flex items-center gap-1"
                            ><UserCheck size={10} /> Activate</button>
                          )}
                          <button
                            onClick={() => setConfirmModal({ type: 'delete', userId: u._id, value: null, label: `Permanently delete user "${u.name}"? This cannot be undone.` })}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md hover:bg-red-100 font-medium transition-colors flex items-center gap-1"
                          ><Trash2 size={10} /> Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <ConfirmModal
          modal={confirmModal}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ── Edit User Modal ── */}
      {editTarget && (
        <EditUserModal
          editTarget={editTarget}
          token={user.token}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            fetchUsers();
            setActionSuccess(`User "${editTarget.name}" updated successfully.`);
          }}
        />
      )}

      {/* ── Create User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Create New User</h3>
                <p className="text-xs text-gray-400">Fill in all fields below</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setAddError(''); setAddSuccess(''); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <Toast type="success" msg={addSuccess} onDismiss={() => setAddSuccess('')} />
            <Toast type="error" msg={addError} onDismiss={() => setAddError('')} />

            <form onSubmit={handleAddUser} className="space-y-4" autoComplete="off">
              <input type="text" style={{ display: 'none' }} autoComplete="username" readOnly />
              <input type="password" style={{ display: 'none' }} autoComplete="new-password" readOnly />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input autoComplete="name" value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className={inputClass} placeholder="Full Name" />
                </Field>
                <Field label="Username" required>
                  <input autoComplete="off" value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    className={inputClass} placeholder="username" />
                </Field>
              </div>

              <Field label="Email" required>
                <input type="email" autoComplete="email" value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className={inputClass} placeholder="email@example.com" />
              </Field>

              <Field label="Password" required>
                <div className="relative">
                  <input
                    type={showAddPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className={inputClass + ' pr-10'}
                    placeholder="Min 6 characters"
                  />
                  <button type="button" onClick={() => setShowAddPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showAddPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              <Field label="Role" required>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className={inputClass}>
                  <option value="user">User / Cadet</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] disabled:opacity-60 transition-colors">
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
                <button type="button"
                  onClick={() => { setShowAddModal(false); setAddError(''); setAddSuccess(''); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
