import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HardHat,
  Wrench,
  Clock,
  CheckCircle2,
  AlertOctagon,
  MapPin,
  ArrowRight,
  TrendingUp,
  Activity,
  Play,
  CheckCircle,
} from 'lucide-react';
import { getAssignedToMe, updateWorkerStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WorkerDashboard() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workerStatus, setWorkerStatus] = useState(currentUser?.status || 'available');

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getAssignedToMe();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load worker tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [currentUser]);

  const handleStatusChange = async (newStatus) => {
    try {
      setWorkerStatus(newStatus);
      if (currentUser?._id) {
        await updateWorkerStatus(currentUser._id, newStatus);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const assignedTasks = tasks.filter(
    (t) => t.status === 'ASSIGNED' || t.status === 'Assigned'
  );
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'In Progress'
  );
  const pendingVerificationTasks = tasks.filter(
    (t) => t.status === 'PENDING_VERIFICATION'
  );
  const completedTasks = tasks.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'Resolved'
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Worker Header */}
        <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-900/30">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <HardHat className="w-3.5 h-3.5" />
              Municipal Field Operations Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Field Specialist {currentUser?.name || 'Technician'}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Department: <span className="text-amber-400 font-semibold">{currentUser?.department || 'Roads & Infrastructure'}</span> • Zone: <span className="font-semibold text-white">{currentUser?.assigned_ward || 'Central Ward'}</span>
            </p>
          </div>

          {/* Status Quick Switch */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">DISPATCH STATUS:</span>
            <div className="flex items-center gap-1">
              {['available', 'busy', 'offline'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                    workerStatus === st
                      ? st === 'available'
                        ? 'bg-emerald-600 text-white'
                        : st === 'busy'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{assignedTasks.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Assigned Tasks</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">In Progress (Repairs Active)</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingVerificationTasks.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Awaiting Admin Verification</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedTasks.length + (currentUser?.completed_tasks_count || 0)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Completed Repairs</div>
            </div>
          </div>
        </div>

        {/* Priority Work Queue */}
        <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-500" />
              Active Dispatch Queue
            </h2>
            <Link
              to="/worker/tasks"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View complete queue ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Loading assigned tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No tasks currently dispatched to your queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {task.severity || 'MEDIUM'} PRIORITY
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        #{task._id.toString().slice(-4)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {task.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {task.title || task.defect_type?.replace('_', ' ').toUpperCase()}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {task.location?.address || task.location?.ward || 'Central Ward'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      to={`/worker/tasks/${task._id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      Inspect Task
                    </Link>

                    {task.status === 'IN_PROGRESS' || task.status === 'In Progress' ? (
                      <Link
                        to={`/worker/tasks/${task._id}/resolve`}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Submit Completion
                      </Link>
                    ) : (
                      <Link
                        to={`/worker/tasks/${task._id}`}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start Work
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
