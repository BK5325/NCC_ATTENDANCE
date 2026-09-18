import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Shirt, Plus, Trash2, IndianRupee, Pencil } from 'lucide-react';

const UniformPayments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [cadets, setCadets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    cadetId: '',
    item: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, cadetsRes] = await Promise.all([
        axios.get('/api/uniform-payments', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('/api/cadets', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setPayments(paymentsRes.data);
      setCadets(cadetsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/uniform-payments', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPayments([data, ...payments]);
      setShowModal(false);
      setFormData({ cadetId: '', item: '', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add payment.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/uniform-payments/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPayments(payments.filter(p => p._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`/api/uniform-payments/${editRecord._id}`, editRecord, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPayments(payments.map(p => p._id === editRecord._id ? data : p));
      setEditRecord(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
            <Shirt size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Uniform & Equipment Payments</h1>
            <p className="text-sm text-gray-500">Track payments from cadets</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] transition-colors"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadet Reg. No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadet Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recorded By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No payment records found.</td></tr>
              ) : payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{p.cadet?.regNo || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.cadet?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-800">{p.item}</td>
                  <td className="px-4 py-3 font-semibold text-green-700 flex items-center gap-1">
                    <IndianRupee size={14} /> {p.amount}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.createdBy?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditRecord({...p, cadetId: p.cadet?._id, date: p.date.split('T')[0]})} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Record Uniform Payment</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cadet</label>
                <select
                  required
                  value={formData.cadetId}
                  onChange={(e) => setFormData({...formData, cadetId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                >
                  <option value="">Select a cadet...</option>
                  {cadets.map(c => (
                    <option key={c._id} value={c._id}>{c.regNo} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item (e.g., Uniform, Jersey)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Jersey"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e]">
                  Save Payment
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Edit Uniform Payment</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cadet</label>
                <select
                  required
                  value={editRecord.cadetId}
                  onChange={(e) => setEditRecord({...editRecord, cadetId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                >
                  <option value="">Select a cadet...</option>
                  {cadets.map(c => (
                    <option key={c._id} value={c._id}>{c.regNo} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item (e.g., Uniform, Jersey)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Jersey"
                  value={editRecord.item}
                  onChange={(e) => setEditRecord({...editRecord, item: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={editRecord.amount}
                    onChange={(e) => setEditRecord({...editRecord, amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={editRecord.date}
                    onChange={(e) => setEditRecord({...editRecord, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530]"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e]">
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditRecord(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Delete Payment Record?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniformPayments;
