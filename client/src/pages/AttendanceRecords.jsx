import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, Filter, Search, Pencil, Trash2 } from 'lucide-react';

const NCC_YEARS = ['All Years', '1st Year', '2nd Year - B Certificate', '3rd Year - C Certificate'];

const AttendanceRecords = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [year, setYear] = useState('All Years');
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (date) params.date = date;
      if (year !== 'All Years') params.year = year;
      const { data } = await axios.get('/api/attendance', {
        params,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/attendance/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRecords(records.filter(r => r._id !== id));
      setDeleteRecordId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/attendance/${editRecord._id}`, { status: editRecord.status }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update record.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-sm text-gray-500">{records.length} record(s) found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">NCC Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] bg-white">
            {NCC_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={fetchRecords} className="px-5 py-2 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] transition-colors flex items-center gap-2">
          <Filter size={15}/> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg. No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadet Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NCC Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Marked By</th>
                {user?.role === 'admin' || user?.role === 'staff' ? <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">No attendance records found.</td></tr>
              ) : records.map((r, idx) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-700">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{r.cadetId?.regNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.cadetId?.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.cadetId?.year}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.markedBy?.name || '—'}</td>
                  {(user?.role === 'admin' || user?.role === 'staff') && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditRecord(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteRecordId(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Attendance</h3>
            <div className="mb-4 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-800">Date:</span> {new Date(editRecord.date).toLocaleDateString('en-IN')}</p>
              <p><span className="font-semibold text-gray-800">Cadet:</span> {editRecord.cadetId?.name} ({editRecord.cadetId?.regNo})</p>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={editRecord.status} 
                  onChange={e => setEditRecord({...editRecord, status: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2c5530] bg-white"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-[#2c5530] text-white font-semibold rounded-lg hover:bg-[#1b381e]">Save</button>
                <button type="button" onClick={() => setEditRecord(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRecordId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Record?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteRecordId)} className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">Delete</button>
              <button onClick={() => setDeleteRecordId(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecords;
