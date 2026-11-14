import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  ShieldAlert,
  HardHat,
  UserCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export default function RoleBanner() {
  const { currentUser, currentRole, demoUsers, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const navigate = useNavigate();
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  if (!currentUser) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 text-xs text-slate-300 px-4 py-2 flex justify-end gap-3">
        <button type="button" onClick={() => navigate('/login/citizen')} className="hover:text-white">Citizen login</button>
        <button type="button" onClick={() => navigate('/login/worker')} className="hover:text-white">Worker login</button>
        <button type="button" onClick={() => navigate('/login/admin')} className="hover:text-white">Admin login</button>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'worker':
      case 'supervisor':
        return <HardHat className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const handleRoleQuickSwitch = (targetRole) => {
    logout();
    navigate(`/login/${targetRole}`);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs text-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-3 relative z-40">
      {/* Left: Persona Switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium tracking-wide">
          <Users className="w-3 h-3" />
          DEMO PERSONA:
        </span>

        {/* Fast Role Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => handleRoleQuickSwitch('citizen')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              currentRole === 'citizen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            Citizen
          </button>
          <button
            type="button"
            onClick={() => handleRoleQuickSwitch('worker')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              currentRole === 'worker' || currentRole === 'supervisor'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <HardHat className="w-3 h-3" />
            Field Worker
          </button>
          <button
            type="button"
            onClick={() => handleRoleQuickSwitch('admin')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              currentRole === 'admin'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Admin Command
          </button>
        </div>

        {/* Detailed User Switch Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 transition"
          >
            {getRoleIcon(currentRole)}
            <span className="font-semibold text-slate-100">{currentUser?.name || 'Select Profile'}</span>
            <span className="text-slate-400">({currentUser?.department || currentRole})</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showUserDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Demo Account
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                {demoUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                      navigate(`/login/${user.role}`, {
                        state: { email: user.email },
                      });
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 transition ${
                      currentUser?._id === user._id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100 flex items-center gap-1.5">
                        {getRoleIcon(user.role)}
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 pl-5">
                        {user.role.toUpperCase()} • {user.department || user.assigned_ward}
                      </div>
                    </div>
                    {currentUser?._id === user._id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Notification Center & Portal Quick Links */}
      <div className="flex items-center gap-3">
        {/* Live Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBellMenu(!showBellMenu)}
            className="relative p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 transition"
            title="Live Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showBellMenu && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-800">
                <span className="font-semibold text-slate-200">Real-Time Alerts</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markNotificationRead(n._id)}
                      className={`p-3 text-left hover:bg-slate-800/60 cursor-pointer transition ${
                        !n.is_read ? 'bg-slate-800/30' : 'opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {n.title}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt || n.created_at || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Portal Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <span>PORTAL:</span>
          <span className="text-slate-200 font-semibold uppercase">
            {currentRole === 'admin' ? 'Command Center' : currentRole === 'worker' ? 'Field Ops' : 'Citizen'}
          </span>
          <button type="button" onClick={logout} className="ml-3 text-slate-400 hover:text-white">Sign out</button>
        </div>
      </div>
    </div>
  );
}
