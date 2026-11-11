import React, { useState, useEffect } from 'react';
import {
  Users,
  HardHat,
  Search,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Activity,
} from 'lucide-react';
import { getWorkers, updateWorkerStatus } from '../../services/api';

export default function AdminWorkerManager() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const loadWorkers = async () => {
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleStatusToggle = async (workerId, newStatus) => {
    try {
      await updateWorkerStatus(workerId, newStatus);
      await loadWorkers();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filtered = workers.filter((w) => {
    const matchesSearch =
      (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.assigned_ward || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (departmentFilter === 'ALL') return matchesSearch;
    return matchesSearch && w.department === departmentFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-500" />
            Municipal Field Fleet Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitor technician availability, department workloads, and dispatch readiness in real time.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#111C2F] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by worker name, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              'ALL',
              'Roads & Infrastructure',
              'Sanitation & Waste',
              'Electrical & Lighting',
              'Water & Sewage',
            ].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  departmentFilter === dept
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-[#17243A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Workers Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
            Loading field fleet...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-sm">
            No technicians found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((worker) => (
              <div
                key={worker._id}
                className="bg-white dark:bg-[#111C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-base">
                      {worker.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {worker.name}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {worker.department}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      worker.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : worker.status === 'busy'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {worker.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-100 dark:border-slate-800/80">
                  <div>
                    <div className="text-slate-400 text-[10px]">Active Tasks</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {worker.active_tasks_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Completed</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {worker.completed_tasks_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Rating</div>
                    <div className="font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {worker.rating || 4.8}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {worker.assigned_ward || 'Central Ward'}
                  </span>

                  {/* Fast Status Toggle */}
                  <select
                    value={worker.status}
                    onChange={(e) => handleStatusToggle(worker._id, e.target.value)}
                    className="p-1 rounded bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
