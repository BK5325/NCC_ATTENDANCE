import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, CalendarDays, AlertCircle, CheckCircle } from 'lucide-react';

const NCC_YEARS = ['All Years', '1st Year', '2nd Year - B Certificate', '3rd Year - C Certificate'];

const MarkAttendance = () => {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState('All Years');
  const [cadets, setCadets] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchCadets = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (year !== 'All Years') params.year = year;
      const { data } = await axios.get('/api/cadets', {
        params,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Sort data by year then by regNo
      const sortedData = data.sort((a, b) => {
        if (a.year !== b.year) return a.year.localeCompare(b.year);
        return a.regNo.localeCompare(b.regNo);
      });
      setCadets(sortedData);
      // Pre-fill attendance as Present
      const init = {};
      sortedData.forEach(c => init[c._id] = 'Present');
      setAttendance(init);
    } catch (err) {
      setError('Failed to fetch cadets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCadets(); }, [year]);

  const toggle = (id, status) => setAttendance(prev => ({ ...prev, [id]: status }));

  const markAll = (status) => {
    const updated = {};
    cadets.forEach(c => updated[c._id] = status);
    setAttendance(updated);
  };

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'Absent').length;

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const records = cadets.map(c => ({
        cadetId: c._id,
        status: attendance[c._id] || 'Absent',
      }));
      await axios.post('/api/attendance', { date, attendanceRecords: records }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess(`Attendance saved for ${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}!`);
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance.');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
          <CheckSquare size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-sm text-gray-500">Select date and year, then mark attendance</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attendance Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530]" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">NCC Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] bg-white">
            {NCC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Feedback */}
      {success && <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm"><CheckCircle size={16}/>{success}</div>}
      {error && <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm"><AlertCircle size={16}/>{error}</div>}

      {/* Bulk Actions */}
      {cadets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => markAll('Present')} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-200 transition-colors">✓ Mark All Present</button>
              <button onClick={() => markAll('Absent')} className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition-colors">✗ Mark All Absent</button>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
              <span className="text-red-600">Absent: <strong>{absentCount}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Cadets List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
        {/* Year Heading */}
        <div className="bg-[#2c5530] text-white px-5 py-3 font-bold uppercase tracking-wide text-sm flex items-center gap-2">
          <CalendarDays size={16} />
          {year} — {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading cadets...</div>
        ) : cadets.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No cadets registered for {year}.</div>
        ) : (
          <div className="flex flex-col">
            {['1st Year', '2nd Year - B Certificate', '3rd Year - C Certificate'].map((yearGroup) => {
              const yearCadets = cadets.filter(c => c.year === yearGroup);
              if (yearCadets.length === 0) return null;

              return (
                <div key={yearGroup} className="border-b border-gray-100 last:border-b-0">
                  {year === 'All Years' && (
                    <div className="bg-gray-100/80 px-5 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200/60">
                      {yearGroup}
                    </div>
                  )}
                  <div className="divide-y divide-gray-100">
                    {yearCadets.map((c, sectionIdx) => {
                      const globalIdx = cadets.findIndex(x => x._id === c._id);
                      return (
                        <div key={c._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                              {globalIdx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{c.regNo}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggle(c._id, 'Present')}
                              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${attendance[c._id] === 'Present' ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
                            >Present</button>
                            <button
                              onClick={() => toggle(c._id, 'Absent')}
                              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${attendance[c._id] === 'Absent' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                            >Absent</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button */}
      {cadets.length > 0 && (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 bg-[#2c5530] hover:bg-[#1b381e] text-white font-bold rounded-xl transition-colors text-sm"
        >
          Save Attendance
        </button>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1 text-lg">Save Attendance?</h3>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} — {year}
            </p>
            <div className="flex gap-4 mb-5">
              <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                <p className="text-xs text-green-500 font-medium">Present</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                <p className="text-xs text-red-500 font-medium">Absent</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#2c5530] text-white text-sm font-bold rounded-lg hover:bg-[#1b381e] disabled:opacity-60">
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
