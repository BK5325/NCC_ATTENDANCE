import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
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
      } catch (err) {
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
    } catch (err) {
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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Configure NCC unit and attendance settings</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {loading ? (
          <div className="py-10 text-center text-gray-400">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {success && <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg p-3 text-sm"><CheckCircle size={14}/>{success}</div>}
            {error && <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-3 text-sm"><AlertCircle size={14}/>{error}</div>}

            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                />
                {f.key === 'attendanceThreshold' && (
                  <p className="text-xs text-gray-400 mt-1">Cadets below this percentage will be flagged as "Low Attendance".</p>
                )}
              </div>
            ))}

            <div className="pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2c5530] hover:bg-[#1b381e] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
