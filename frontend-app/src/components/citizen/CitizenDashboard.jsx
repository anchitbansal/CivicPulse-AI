import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { getMyReports, getTickets } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [myTickets, setMyTickets] = useState([]);
  const [communityTickets, setCommunityTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [my, all] = await Promise.all([getMyReports(), getTickets()]);
        setMyTickets(my);
        setCommunityTickets(all.slice(0, 4));
      } catch (err) {
        console.error('Failed to load citizen dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const activeReports = myTickets.filter(
    (t) => t.status !== 'RESOLVED' && t.status !== 'Resolved'
  );
  const resolvedReports = myTickets.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'Resolved'
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REPORTED':
      case 'Pending':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'ASSIGNED':
      case 'Assigned':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'IN_PROGRESS':
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'PENDING_VERIFICATION':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'RESOLVED':
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'REOPENED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Citizen Civic Intelligence
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {currentUser?.name || 'Citizen'}
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Report municipal defects, inspect AI verification results, and track repair crews in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/citizen/report"
                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                Report Defect
              </Link>
              <Link
                to="/citizen/issues"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-md border border-white/15 transition flex items-center gap-2"
              >
                My Complaints ({myTickets.length})
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeReports.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Complaints</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{resolvedReports.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Verified & Resolved</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{communityTickets.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Neighborhood Incidents</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">96.4%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">SLA Resolution Rate</div>
            </div>
          </div>
        </div>

        {/* Two-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: My Recent Complaints */}
          <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                My Tracked Complaints
              </h2>
              <Link
                to="/citizen/issues"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm animate-pulse">Loading reports...</div>
            ) : myTickets.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't filed any complaints yet.</p>
                <Link
                  to="/citizen/report"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  File your first report
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.slice(0, 3).map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/citizen/issues/${ticket._id}`}
                    className="block p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/40 transition group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            #{ticket._id.toString().slice(-4)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm group-hover:text-blue-500 transition line-clamp-1">
                          {ticket.title || ticket.defect_type}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ticket.location?.address || ticket.location?.ward || 'Central Ward'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Community Activity & Fast Actions */}
          <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                Community Reports Feed
              </h2>
              <span className="text-xs text-slate-400">Live AI consolidation</span>
            </div>

            <div className="space-y-3">
              {communityTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs capitalize text-slate-800 dark:text-slate-200">
                        {ticket.defect_type?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {ticket.severity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ticket.location?.address || ticket.location?.ward || 'Nearby'}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
