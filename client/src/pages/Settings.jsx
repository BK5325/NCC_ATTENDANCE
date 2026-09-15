import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  User,
  Eye,
  EyeOff,
  Building2,
  Save,
} from 'lucide-react';

/* ─── Shared styles ──────────────────────────────────────────────────── */
const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] focus:border-transparent transition-all bg-white';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

/* ─── Toast ──────────────────────────────────────────────────────────── */
const Toast = ({ type, msg, onDismiss }) => {
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-3 text-sm mb-4 ${
        ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
      }`}
    >
      {ok ? <CheckCircle size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
      <span className="flex-1">{msg}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-auto text-current opacity-60 hover:opacity-100 text-xs font-bold">✕</button>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   MY PROFILE SECTION
════════════════════════════════════════════════════════════════════════ */
const ProfileSection = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // Track whether user has deliberately typed a password
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Populate fields from context whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTouched(false);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    // Basic validations
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!username.trim()) { setError('Username is required.'); return; }
    if (passwordTouched && newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.'); return;
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
      // Only include password if user deliberately typed one
      if (passwordTouched && newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const { data } = await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Update context + localStorage — preserve old token if API doesn't return a new one
      updateUser({ ...data, token: data.token || user.token });
      setSuccess('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTouched(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Avatar + name row */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-[#2c5530] text-white flex items-center justify-center font-bold text-lg uppercase select-none">
          {name?.[0] || user?.name?.[0] || 'U'}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize font-medium">{user?.role} • {user?.username}</p>
        </div>
      </div>

      <Toast type="success" msg={success} onDismiss={() => setSuccess('')} />
      <Toast type="error" msg={error} onDismiss={() => setError('')} />

      <form onSubmit={handleSave} className="space-y-4" autoComplete="off">
        {/* Hidden dummy fields to fool browser autofill */}
        <input type="text" name="fake_username" autoComplete="username" style={{ display: 'none' }} readOnly />
        <input type="password" name="fake_password" autoComplete="new-password" style={{ display: 'none' }} readOnly />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *">
            <input
              autoComplete="name"
              className={inputClass}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
            />
          </Field>
          <Field label="Username *">
            <input
              autoComplete="off"
              className={inputClass}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
            />
          </Field>
        </div>

        <Field label="Email Address *">
          <input
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </Field>

        {/* Password section — separate from above so autofill doesn't cross-contaminate */}
        <div className="rounded-lg border border-dashed border-gray-200 p-4 mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🔒 Change Password — leave both fields blank to keep current password
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
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm New Password">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                className={inputClass}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPasswordTouched(true); }}
                placeholder="Repeat new password"
              />
            </Field>
          </div>
          {/* Live match indicator */}
          {passwordTouched && newPassword && confirmPassword && (
            <p className={`text-xs mt-2 font-medium ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
              {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2c5530] hover:bg-[#1b381e] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   SYSTEM SETTINGS SECTION (Admin only)
════════════════════════════════════════════════════════════════════════ */
const SystemSettingsSection = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    institutionName: '',
    nccUnit: '',
    academicYear: '',
    attendanceThreshold: 75,
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
          attendanceThreshold: data.attendanceThreshold ?? 75,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load settings. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await axios.put('/api/settings', form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('System settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'institutionName', label: 'Institution / College Name', placeholder: 'e.g. ABC Engineering College', type: 'text' },
    { key: 'nccUnit', label: 'NCC Unit Name', placeholder: 'e.g. 1 TN Battalion NCC', type: 'text' },
    { key: 'academicYear', label: 'Academic Year', placeholder: 'e.g. 2026-27', type: 'text' },
    { key: 'attendanceThreshold', label: 'Low Attendance Threshold (%)', placeholder: '75', type: 'number' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#2c5530] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Toast type="success" msg={success} onDismiss={() => setSuccess('')} />
      <Toast type="error" msg={error} onDismiss={() => setError('')} />

      <form onSubmit={handleSave} className="space-y-5">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              min={f.type === 'number' ? 0 : undefined}
              max={f.type === 'number' ? 100 : undefined}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
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
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2c5530] hover:bg-[#1b381e] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
════════════════════════════════════════════════════════════════════════ */
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
        <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center shadow-sm">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile and system preferences</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
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

      {/* Tab content */}
      {tab === 'profile' && <ProfileSection />}
      {tab === 'system' && isAdmin && <SystemSettingsSection />}
    </div>
  );
};

export default Settings;
