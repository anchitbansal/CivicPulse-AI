import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getMyReports } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CitizenComplaintsList() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getMyReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to load my reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [currentUser]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.defect_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report._id || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE')
      return matchesSearch && report.status !== 'RESOLVED' && report.status !== 'Resolved';
    if (statusFilter === 'RESOLVED')
      return matchesSearch && (report.status === 'RESOLVED' || report.status === 'Resolved');
    return matchesSearch && report.status === statusFilter;
  });

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-blue-500" />
              My Reported Complaints
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track lifecycle updates, inspector verifications, and submit resolution feedback.
            </p>
          </div>

          <Link
            to="/citizen/report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition self-start sm:self-auto"
          >
            <Camera className="w-4 h-4" />
            File New Complaint
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-[#111C2F] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by defect, address, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'ACTIVE', 'PENDING_VERIFICATION', 'RESOLVED', 'REOPENED'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-[#17243A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Loading complaints...</div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No complaints found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search or status filters.'
                : 'You have not reported any civic issues yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <Link
                key={report._id}
                to={`/citizen/issues/${report._id}`}
                className="bg-white dark:bg-[#111C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{report._id.toString().slice(-6)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition line-clamp-1">
                    {report.title || report.defect_type?.replace('_', ' ').toUpperCase()}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {report.description || 'Defect reported by citizen.'}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.location?.address || report.location?.ward || 'Central Ward'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                    View Progress <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
