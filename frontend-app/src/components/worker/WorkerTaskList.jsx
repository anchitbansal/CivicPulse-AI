import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  Play,
  CheckCircle,
} from 'lucide-react';
import { getAssignedToMe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WorkerTaskList() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getAssignedToMe();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [currentUser]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.defect_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task._id || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') {
      return (
        matchesSearch &&
        (task.status === 'ASSIGNED' ||
          task.status === 'Assigned' ||
          task.status === 'IN_PROGRESS' ||
          task.status === 'In Progress')
      );
    }
    return matchesSearch && task.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-amber-500" />
            Assigned Field Work Tasks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Accept municipal repair dispatches, record on-site progress, and upload before/after photographic proof.
          </p>
        </div>

        {/* Filter controls */}
        <div className="bg-white dark:bg-[#111C2F] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search assigned tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'ACTIVE', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'RESOLVED'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === filter
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-[#17243A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Cards */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Loading work tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No tasks found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No tasks match your selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white dark:bg-[#111C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {task.severity || 'MEDIUM'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      #{task._id.toString().slice(-4)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                    {task.title || task.defect_type?.replace('_', ' ').toUpperCase()}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.location?.address || task.location?.ward || 'Central Ward'}</span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Status: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.status}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    to={`/worker/tasks/${task._id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                  >
                    View Details
                  </Link>

                  {task.status === 'IN_PROGRESS' || task.status === 'In Progress' ? (
                    <Link
                      to={`/worker/tasks/${task._id}/resolve`}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Submit Completion
                    </Link>
                  ) : task.status === 'PENDING_VERIFICATION' ? (
                    <span className="text-xs font-semibold text-cyan-500">
                      Awaiting Signoff
                    </span>
                  ) : task.status === 'RESOLVED' || task.status === 'Resolved' ? (
                    <span className="text-xs font-semibold text-emerald-500">
                      Approved & Closed
                    </span>
                  ) : (
                    <Link
                      to={`/worker/tasks/${task._id}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Accept & Start
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
