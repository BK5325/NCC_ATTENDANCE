import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#2c5530', '#d4af37', '#e05e5e'];
const PIE_COLORS = ['#2c5530', '#e05e5e'];

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [monthly, setMonthly] = useState([]);
  const [byYear, setByYear] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const [ovRes, monRes, yearRes] = await Promise.all([
          axios.get('/api/analytics/overview', config),
          axios.get(`/api/analytics/monthly?year=${selectedYear}`, config),
          axios.get('/api/analytics/by-year', config),
        ]);
        setOverview(ovRes.data);
        setMonthly(monRes.data);
        setByYear(yearRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [selectedYear]);

  const pieData = overview
    ? [
        { name: 'Present', value: Number(overview.overallPercentage) },
        { name: 'Absent', value: 100 - Number(overview.overallPercentage) },
      ]
    : [];

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="text-gray-400">Loading analytics...</div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#2c5530] text-white rounded-xl flex items-center justify-center">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Attendance statistics and trends</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#2c5530]">{overview?.totalCadets || 0}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">Total Cadets</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-green-600">{overview?.todayPresent || 0}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">Present Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-red-500">{overview?.todayAbsent || 0}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">Absent Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-yellow-600">{overview?.overallPercentage || 0}%</p>
          <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">Overall %</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={18} className="text-[#2c5530]" /> Monthly Attendance</h2>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2c5530]">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="#2c5530" radius={[4,4,0,0]} />
              <Bar dataKey="absent" name="Absent" fill="#e05e5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Overall Present vs Absent</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#2c5530] inline-block"/><span className="text-xs text-gray-600">Present</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#e05e5e] inline-block"/><span className="text-xs text-gray-600">Absent</span></div>
          </div>
        </div>
      </div>

      {/* Attendance by NCC Year */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Attendance by NCC Year</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byYear} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="present" name="Present" fill="#2c5530" radius={[4,4,0,0]} />
            <Bar dataKey="absent" name="Absent" fill="#e05e5e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Year-wise Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900 text-sm">Year-wise Summary</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">NCC Year</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cadets</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Present</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Absent</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {byYear.map((row) => (
              <tr key={row.year} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{row.year}</td>
                <td className="px-5 py-3 text-gray-600">{row.cadets}</td>
                <td className="px-5 py-3 text-green-600 font-semibold">{row.present}</td>
                <td className="px-5 py-3 text-red-500 font-semibold">{row.absent}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                      <div className="bg-[#2c5530] h-2 rounded-full" style={{ width: `${row.percentage}%` }} />
                    </div>
                    <span className={`font-bold text-sm ${row.percentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>{row.percentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
