import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Camera,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
  ClipboardList,
  Wrench,
  CheckCircle,
  Users,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentRole, currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#111C2F]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-navy-800 dark:bg-navy-700 text-cyan-400 flex items-center justify-center shadow-subtle group-hover:bg-navy-900 transition-colors">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-navy-900 dark:text-white tracking-tight flex items-center gap-1.5">
                CivicPulse <span className="text-brand-500 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium hidden sm:inline">
                GovTech Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav - Contextual to active portal/role */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-[#17243A] p-1.5 rounded-full border border-slate-200/90 dark:border-slate-700/80">
            {currentRole === 'citizen' && (
              <>
                <NavLink
                  to="/citizen/dashboard"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-[#111C2F] text-blue-600 dark:text-blue-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Activity className="w-3.5 h-3.5" />
                  Citizen Hub
                </NavLink>
                <NavLink
                  to="/citizen/report"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-[#111C2F] text-brand-600 dark:text-brand-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Camera className="w-3.5 h-3.5" />
                  Report Issue
                </NavLink>
                <NavLink
                  to="/citizen/issues"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-[#111C2F] text-blue-600 dark:text-blue-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  My Complaints
                </NavLink>
              </>
            )}

            {(currentRole === 'worker' || currentRole === 'supervisor') && (
              <>
                <NavLink
                  to="/worker/dashboard"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-[#111C2F] text-amber-600 dark:text-amber-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Task Queue
                </NavLink>
                <NavLink
                  to="/worker/tasks"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-[#111C2F] text-amber-600 dark:text-amber-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Assigned Repairs
                </NavLink>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-navy-800 dark:bg-navy-900 text-cyan-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Activity className="w-3.5 h-3.5" />
                  Command Center
                </NavLink>
                <NavLink
                  to="/admin/complaints"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-navy-800 dark:bg-navy-900 text-cyan-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Complaints
                </NavLink>
                <NavLink
                  to="/admin/verifications"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-navy-800 dark:bg-navy-900 text-cyan-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approvals
                </NavLink>
                <NavLink
                  to="/admin/workers"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-navy-800 dark:bg-navy-900 text-cyan-400 shadow-subtle'
                        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Users className="w-3.5 h-3.5" />
                  Fleet
                </NavLink>
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#17243A] hover:text-navy-900 dark:hover:text-white transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {!currentUser && (
              <div className="flex items-center gap-3 text-xs font-semibold">
                <Link to="/login/citizen" className="text-brand-600 hover:underline">Sign in</Link>
                <Link to="/signup" className="rounded-lg bg-brand-600 text-white px-3 py-1.5">Sign up</Link>
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PORTAL SYNCED
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2F] px-4 pt-2 pb-4 space-y-1">
          {currentRole === 'citizen' && (
            <>
              <NavLink
                to="/citizen/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Citizen Hub
              </NavLink>
              <NavLink
                to="/citizen/report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Report Issue
              </NavLink>
              <NavLink
                to="/citizen/issues"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                My Complaints
              </NavLink>
            </>
          )}

          {(currentRole === 'worker' || currentRole === 'supervisor') && (
            <>
              <NavLink
                to="/worker/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Worker Queue
              </NavLink>
              <NavLink
                to="/worker/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Assigned Repairs
              </NavLink>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Command Center
              </NavLink>
              <NavLink
                to="/admin/complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Complaints
              </NavLink>
              <NavLink
                to="/admin/verifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Approvals
              </NavLink>
              <NavLink
                to="/admin/workers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Fleet
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
