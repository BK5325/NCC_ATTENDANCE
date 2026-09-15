import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, BarChart3,
  FileText, Settings, LogOut, Menu, X, Shield, ChevronRight,
  CheckSquare, UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-white/20 text-white'
        : 'text-green-100 hover:bg-white/10 hover:text-white'
    }`;

  const staffAdminLinks = [
    { to: user?.role === 'admin' ? '/admin' : '/staff', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/cadets', icon: <Users size={18} />, label: 'Cadets' },
    { to: '/cadets/add', icon: <UserPlus size={18} />, label: 'Add Cadet' },
    { to: '/attendance/mark', icon: <CheckSquare size={18} />, label: 'Mark Attendance' },
    { to: '/attendance/records', icon: <ClipboardList size={18} />, label: 'Attendance Records' },
    { to: '/reports', icon: <FileText size={18} />, label: 'Reports' },
    { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  const adminOnlyLinks = [
    { to: '/users', icon: <UserCheck size={18} />, label: 'User Management' },
  ];

  const cadetLinks = [
    { to: '/cadet', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/cadet/attendance', icon: <ClipboardList size={18} />, label: 'My Attendance' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  const links = user?.role === 'user' ? cadetLinks : staffAdminLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-green-900" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">NCC Attendance</p>
            <p className="text-green-300 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-400 text-green-900 rounded-full flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-yellow-300 text-xs uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/admin' || link.to === '/staff' || link.to === '/cadet'} className={navLinkClass} onClick={() => setIsOpen(false)}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-3 pb-1 px-1">
              <p className="text-green-400 text-xs uppercase tracking-widest font-semibold">Admin Only</p>
            </div>
            {adminOnlyLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setIsOpen(false)}>
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#2c5530] text-white p-2 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-[#1b3d1f] z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1b3d1f] h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
