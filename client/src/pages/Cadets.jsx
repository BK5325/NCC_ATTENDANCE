import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Search, UserPlus, Eye, Pencil, Trash2, Filter } from 'lucide-react';

const NCC_YEARS = ['All Years', '1st Year', '2nd Year - B Certificate', '3rd Year - C Certificate'];

const yearBadgeColor = (year) => {
  if (year === '1st Year') return 'bg-blue-100 text-blue-700';
  if (year === '2nd Year - B Certificate') return 'bg-purple-100 text-purple-700';
  return 'bg-orange-100 text-orange-700';
};

const Cadets = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cadets, setCadets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [deleteId, setDeleteId] = useState(null);

  const fetchCadets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (yearFilter !== 'All Years') params.year = yearFilter;
      const { data } = await axios.get('/api/cadets', {
        params,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCadets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCadets(); }, [yearFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCadets();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/cadets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCadets(cadets.filter(c => c._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadet Management</h1>
            <p className="text-sm text-gray-500">{cadets.length} cadet(s) registered</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/cadets/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2c5530] text-white text-sm font-semibold rounded-lg hover:bg-[#1b381e] transition-colors"
        >
          <UserPlus size={16} /> Add Cadet
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or reg. no..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2c5530] focus:border-[#2c5530]"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#2c5530] text-white text-sm font-medium rounded-lg hover:bg-[#1b381e] transition-colors">
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2c5530] bg-white"
          >
            {NCC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg. No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NCC Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : cadets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  <Users size={32} className="mx-auto mb-2 text-gray-300" />
                  No cadets found.
                </td></tr>
              ) : cadets.map((c, idx) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{c.regNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${yearBadgeColor(c.year)}`}>{c.year}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user?.role === 'admin' && (
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Cadet?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
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

export default Cadets;
