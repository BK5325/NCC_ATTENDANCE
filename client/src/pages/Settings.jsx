import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react';

/* ─── Reusable field ─────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] focus:border-transparent transition-all';

/* ─── Toast ──────────────────────────────────────────────────────────── */
const Toast = ({ type, msg }) => {
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-3 text-sm mb-4 ${
        ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MY PROFILE SECTION
══════════════════════════════════════════════════════════════════════ */
const ProfileSection = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Prefill from current user
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        confirmPassword: '',
      }));
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');

    if (!form.name.trim() || !form.email.trim() || !form.username.trim()) {
      setError('Name, Email and Username are required.'); return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        username: form.username,
      };
      if (form.password.trim()) payload.password = form.password;

      const { data } = await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Keep token if API returns a new one
      updateUser({ ...data, token: data.token || user.token });
      setSuccess('Profile updated successfully!');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-[#2c5530] text-white flex items-center justify-center font-bold text-base uppercase">
          {user?.name?.[0] || 'U'}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      <Toast type="success" msg={success} />
      <Toast type="error" msg={error} />

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name"
            />
          </Field>
          <Field label="Username *">
            <input
              className={inputClass}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="username"
            />
          </Field>
        </div>

        <Field label="Email Address *">
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@example.com"
          />
        </Field>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Change Password (leave blank to keep current)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New Password">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={inputClass + ' pr-10'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password">
              <input
                type={showPass ? 'text' : 'password'}
                className={inputClass}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </Field>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2c5530] hover:bg-[#1b381e] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SYSTEM SETTINGS SECTION
══════════════════════════════════════════════════════════════════════ */
const SystemSettingsSection = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    institutionName: '', nccUnit: '', academicYear: '', attendanceThreshold: 75,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setForm({
          institutionName: data.institutionName || '',
          nccUnit: data.nccUnit || '',
          academicYear: data.academicYear || '',
          attendanceThreshold: data.attendanceThreshold || 75,
        });
      } catch {
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(''); setError('');
    try {
      await axios.put('/api/settings', form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Settings saved successfully!');
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'institutionName', label: 'Institution / College Name', placeholder: 'ABC College', type: 'text' },
    { key: 'nccUnit', label: 'NCC Unit Name', placeholder: 'Army Wing', type: 'text' },
    { key: 'academicYear', label: 'Academic Year', placeholder: '2026-27', type: 'text' },
    { key: 'attendanceThreshold', label: 'Low Attendance Threshold (%)', placeholder: '75', type: 'number' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {loading ? (
        <div className="py-10 text-center text-gray-400">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <Toast type="success" msg={success} />
          <Toast type="error" msg={error} />

          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className={inputClass}
              />
              {f.key === 'attendanceThreshold' && (
                <p className="text-xs text-gray-400 mt-1">
                  Cadets below this percentage will be flagged as "Low Attendance".
                </p>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2c5530] hover:bg-[#1b381e] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
══════════════════════════════════════════════════════════════════════ */
const Settings = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={15} /> },
    ...(isAdmin ? [{ id: 'system', label: 'System Settings', icon: <Building2 size={15} /> }] : []),
  ];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile and system preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === t.id
                ? 'bg-white text-[#2c5530] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'profile' && <ProfileSection />}
      {tab === 'system' && isAdmin && <SystemSettingsSection />}
    </div>
  );
};

export default Settings;
