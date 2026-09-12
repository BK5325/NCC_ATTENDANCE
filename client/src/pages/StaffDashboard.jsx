import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, UserCheck, UserX, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/analytics/overview', config);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.token]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user.name} ({user.role.toUpperCase()})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cadets Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Cadets</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalCadets || 0}</p>
          </div>
        </div>

        {/* Present Today Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Present Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.todayPresent || 0}</p>
          </div>
        </div>

        {/* Absent Today Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Absent Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.todayAbsent || 0}</p>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.overallPercentage || 0}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cadets by Year */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2 text-gray-500" /> Cadets by Year
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">1st Year</span>
              <span className="font-semibold">{stats?.firstYear || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">2nd Year (B Cert)</span>
              <span className="font-semibold">{stats?.secondYear || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">3rd Year (C Cert)</span>
              <span className="font-semibold">{stats?.thirdYear || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={() => navigate('/cadets/add')} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-[#2c5530] text-white rounded-full flex items-center justify-center mb-2">
                <Users size={20} />
              </div>
              <span className="text-sm font-medium">Add Cadet</span>
            </button>
            <button onClick={() => navigate('/attendance/mark')} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-[#2c5530] text-white rounded-full flex items-center justify-center mb-2">
                <UserCheck size={20} />
              </div>
              <span className="text-sm font-medium">Mark Attendance</span>
            </button>
            <button onClick={() => navigate('/attendance/records')} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-[#2c5530] text-white rounded-full flex items-center justify-center mb-2">
                <BarChart3 size={20} />
              </div>
              <span className="text-sm font-medium">View Reports</span>
            </button>
            {user.role === 'admin' && (
              <button onClick={() => navigate('/users')} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle size={20} />
                </div>
                <span className="text-sm font-medium">Manage Users</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
