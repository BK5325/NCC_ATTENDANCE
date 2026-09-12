import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import Cadets from './pages/Cadets';
import AddCadet from './pages/AddCadet';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceRecords from './pages/AttendanceRecords';
import UserManagement from './pages/UserManagement';

import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Placeholder pages
const CadetDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Cadet Dashboard</h1><p className="text-gray-500 mt-1">Coming soon...</p></div>;
const MyAttendance = () => <div className="p-8"><h1 className="text-2xl font-bold">My Attendance</h1><p className="text-gray-500 mt-1">Coming soon...</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<StaffDashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Staff + Admin shared routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/cadets" element={<Cadets />} />
              <Route path="/cadets/add" element={<AddCadet />} />
              <Route path="/attendance/mark" element={<MarkAttendance />} />
              <Route path="/attendance/records" element={<AttendanceRecords />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>

          {/* Cadet (normal user) Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/cadet" element={<CadetDashboard />} />
              <Route path="/cadet/attendance" element={<MyAttendance />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
