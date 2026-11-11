import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { getTickets } from '../../services/api';
import AdminAssignModal from './AdminAssignModal';

export default function AdminComplaintsManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState(null);

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.defect_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t._id || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REPORTED':
      case 'Pending':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ASSIGNED':
      case 'Assigned':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'IN_PROGRESS':
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PENDING_VERIFICATION':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'RESOLVED':
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REOPENED':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-cyan-500" />
              Complaints Registry & Backlog Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Dispatch municipal field crews, review citizen reports, and monitor SLA timelines.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition self-start sm:self-auto"
          >
            Open Command Map
          </Link>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-[#111C2F] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'RESOLVED', 'REOPENED'].map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    statusFilter === filter
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 dark:bg-[#17243A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#17243A] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">ID & Defect</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Assigned Specialist</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading complaints...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No complaints match criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {t.title || t.defect_type}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          #{t._id.toString().slice(-6)} • {t.defect_type}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{t.location?.address || t.location?.ward || 'Central Ward'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {t.severity || 'MEDIUM'} ({t.priority_score || 50})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {t.assigned_worker_id ? (
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.assigned_worker_id.name}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketForAssign(t)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Dispatch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for dispatching ticket */}
        {selectedTicketForAssign && (
          <AdminAssignModal
            ticket={selectedTicketForAssign}
            onClose={() => setSelectedTicketForAssign(null)}
            onAssigned={loadTickets}
          />
        )}
      </div>
    </div>
  );
}
