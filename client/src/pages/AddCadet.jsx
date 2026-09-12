import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const NCC_YEARS = [
  '1st Year',
  '2nd Year - B Certificate',
  '3rd Year - C Certificate',
];

const AddCadet = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ regNo: '', name: '', year: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.regNo || !form.name || !form.year) {
      setError('Registration Number, Name and NCC Year are required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/cadets', form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess(`Cadet "${form.name}" registered successfully!`);
      setForm({ regNo: '', name: '', year: '', email: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register cadet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/cadets')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors">
          <ArrowLeft size={16} /> Back to Cadets
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
            <UserPlus size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Register New Cadet</h1>
            <p className="text-sm text-gray-500">Add a new cadet to the NCC attendance system</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm">
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Registration Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="regNo" value={form.regNo} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5530] focus:border-[#2c5530] outline-none text-sm"
                placeholder="e.g. NCC001"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Cadet Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name" value={form.name} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5530] focus:border-[#2c5530] outline-none text-sm"
                placeholder="Full Name"
              />
            </div>

            {/* NCC Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                NCC Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year" value={form.year} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5530] focus:border-[#2c5530] outline-none text-sm bg-white"
              >
                <option value="">-- Select Year --</option>
                {NCC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                name="phone" value={form.phone} onChange={handleChange} type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5530] focus:border-[#2c5530] outline-none text-sm"
                placeholder="10-digit phone number"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                name="email" value={form.email} onChange={handleChange} type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c5530] focus:border-[#2c5530] outline-none text-sm"
                placeholder="cadet@example.com"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2c5530] hover:bg-[#1b381e] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : <UserPlus size={16} />}
              {loading ? 'Registering...' : 'Register Cadet'}
            </button>
            <button
              type="button" onClick={() => setForm({ regNo: '', name: '', year: '', email: '', phone: '' })}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCadet;
