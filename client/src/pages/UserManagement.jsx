import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  UserCheck, UserX, Shield, UserPlus, CheckCircle, AlertCircle,
  X, Trash2, Pencil, Eye, EyeOff,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const roleBadge = (role) => {
  if (role === 'admin') return 'bg-red-100 text-red-700';
  if (role === 'staff') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
};

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] focus:border-transparent';

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

/* ─── Edit User Modal ─────────────────────────────────────────────────── */
const EditUserModal = ({ editTarget, onClose, onSaved, token }) => {
  const [form, setForm] = useState({
    name: editTarget.name || '',
    email: editTarget.email || '',
    username: editTarget.username || '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.username.trim()) {
      setError('Name, Email, and Username are required.'); return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, username: form.username };
      if (form.password.trim()) payload.password = form.password;

      await axios.put(`/api/users/${editTarget._id}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Edit User — {editTarget.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">
            <AlertCircle size={14} />{error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className={inputClass} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
            </Field>
            <Field label="Username" required>
              <input className={inputClass} value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" />
            </Field>
          </div>
          <Field label="Email" required>
            <input type="email" className={inputClass} value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </Field>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              New Password (leave blank to keep current)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New Password">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={inputClass + ' pr-10'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={inputClass}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────── */
const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', password: '', role: 'user' });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ── Role change ── */
  const handleRoleChange = async (userId, newRole) => {
    setActionError('');
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchUsers();
      setConfirmModal(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update role.');
      setConfirmModal(null);
    }
  };

  /* ── Status change ── */
  const handleStatusChange = async (userId, newStatus) => {
    setActionError('');
    try {
      await axios.put(`/api/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchUsers();
      setConfirmModal(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
      setConfirmModal(null);
    }
  };

  /* ── Delete ── */
  const handleDeleteUser = async (userId) => {
    setActionError('');
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchUsers();
      setConfirmModal(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete user.');
      setConfirmModal(null);
    }
  };

  /* ── Create user (single-step with role) ── */
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError(''); setAddSuccess('');
    if (!newUser.name || !newUser.email || !newUser.username || !newUser.password) {
      setAddError('All fields are required.'); return;
    }
    setAddLoading(true);
    try {
      // POST with Authorization header → server reads req.user and applies role directly
      await axios.post('/api/auth/register', newUser, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAddSuccess(`User "${newUser.name}" created successfully as ${newUser.role}!`);
      setNewUser({ name: '', email: '', username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage users, staff and admin roles</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] transition-colors"
        >
          <UserPlus size={16} /> Create User / Staff
        </button>
      </div>

      {/* Global action error */}
      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">
          <AlertCircle size={14} />{actionError}
          <button className="ml-auto" onClick={() => setActionError('')}><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No users found.</td></tr>
              ) : users.map((u, idx) => (
                <tr key={u._id} className={`hover:bg-gray-50 ${u._id === user._id ? 'bg-green-50' : ''}`}>
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {u.name} {u._id === user._id && <span className="text-xs text-green-600 font-normal">(You)</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${roleBadge(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* ── Edit profile (all users including self) ── */}
                      <button
                        onClick={() => setEditTarget(u)}
                        className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium transition-colors flex items-center gap-1"
                      >
                        <Pencil size={11} /> Edit
                      </button>

                      {/* ── Role & Status actions (not for self) ── */}
                      {u._id !== user._id && (
                        <>
                          {/* Role Promotion / Demotion */}
                          {u.role !== 'staff' && (
                            <button onClick={() => setConfirmModal({ type: 'role', userId: u._id, value: 'staff', label: `Promote "${u.name}" to Staff?` })}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-medium transition-colors">→ Staff</button>
                          )}
                          {u.role !== 'admin' && (
                            <button onClick={() => setConfirmModal({ type: 'role', userId: u._id, value: 'admin', label: `Promote "${u.name}" to Admin?` })}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium transition-colors">→ Admin</button>
                          )}
                          {u.role !== 'user' && (
                            <button onClick={() => setConfirmModal({ type: 'role', userId: u._id, value: 'user', label: `Demote "${u.name}" to User/Cadet?` })}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors">→ Cadet</button>
                          )}

                          {/* Status Toggle */}
                          {u.status === 'active' ? (
                            <button onClick={() => setConfirmModal({ type: 'status', userId: u._id, value: 'inactive', label: `Deactivate "${u.name}"?` })}
                              className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 font-medium transition-colors flex items-center gap-1">
                              <UserX size={11} /> Deactivate
                            </button>
                          ) : (
                            <button onClick={() => setConfirmModal({ type: 'status', userId: u._id, value: 'active', label: `Activate "${u.name}"?` })}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium transition-colors flex items-center gap-1">
                              <UserCheck size={11} /> Activate
                            </button>
                          )}

                          {/* Delete */}
                          <button onClick={() => setConfirmModal({ type: 'delete', userId: u._id, value: null, label: `Delete user "${u.name}" permanently?` })}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium transition-colors flex items-center gap-1">
                            <Trash2 size={11} /> Delete
                          </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-5">{confirmModal.label}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmModal.type === 'role') handleRoleChange(confirmModal.userId, confirmModal.value);
                  else if (confirmModal.type === 'status') handleStatusChange(confirmModal.userId, confirmModal.value);
                  else if (confirmModal.type === 'delete') handleDeleteUser(confirmModal.userId);
                }}
                className={`flex-1 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2c5530] hover:bg-[#1b381e]'}`}
              >Confirm</button>
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editTarget && (
        <EditUserModal
          editTarget={editTarget}
          token={user.token}
          onClose={() => setEditTarget(null)}
          onSaved={fetchUsers}
        />
      )}

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Create New User / Staff</h3>
              <button onClick={() => { setShowAddModal(false); setAddError(''); setAddSuccess(''); }}
                className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {addSuccess && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg p-3 mb-3 text-sm">
                <CheckCircle size={14} />{addSuccess}
              </div>
            )}
            {addError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-3 mb-3 text-sm">
                <AlertCircle size={14} />{addError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className={inputClass} placeholder="Full Name" />
                </Field>
                <Field label="Username" required>
                  <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    className={inputClass} placeholder="username" />
                </Field>
              </div>
              <Field label="Email" required>
                <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className={inputClass} placeholder="email@example.com" />
              </Field>
              <Field label="Password" required>
                <div className="relative">
                  <input
                    type={showAddPass ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className={inputClass + ' pr-10'}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showAddPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              <Field label="Role" required>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className={inputClass + ' bg-white'}>
                  <option value="user">User / Cadet</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] disabled:opacity-60">
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
                <button type="button"
                  onClick={() => { setShowAddModal(false); setAddError(''); setAddSuccess(''); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">
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
