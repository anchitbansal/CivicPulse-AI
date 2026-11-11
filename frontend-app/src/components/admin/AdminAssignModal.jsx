import React, { useState, useEffect } from 'react';
import { X, Send, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import { getWorkers, assignTicket } from '../../services/api';

export default function AdminAssignModal({ ticket, onClose, onAssigned }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [slaHours, setSlaHours] = useState('24');
  const [priorityOverride, setPriorityOverride] = useState(ticket?.severity || 'MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await getWorkers();
        setWorkers(list);
        if (list.length > 0) {
          // Select first available worker if possible
          const available = list.find((w) => w.status === 'available');
          setSelectedWorkerId(available ? available._id : list[0]._id);
        }
      } catch (err) {
        setError('Failed to load field workers list.');
      }
    }
    load();
  }, []);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError('Please select a field specialist.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await assignTicket({
        ticket_id: ticket._id,
        worker_id: selectedWorkerId,
        instructions,
        priority_override: priorityOverride,
        sla_hours: Number(slaHours),
      });

      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to dispatch ticket');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111C2F] max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
            <UserCheck className="w-5 h-5 text-blue-500" />
            Dispatch Field Specialist
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#17243A] text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white">
            #{ticket._id.toString().slice(-6)}: {ticket.title || ticket.defect_type}
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Location: {ticket.location?.address || ticket.location?.ward || 'Central Ward'}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDispatch} className="space-y-4 text-xs">
          {/* Select Field Worker */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Field Worker *
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workers.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.department}) — {w.status.toUpperCase()} ({w.active_tasks_count || 0} active)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* SLA Deadline */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                SLA Target (Hours)
              </label>
              <select
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="6">6 Hours (Emergency)</option>
                <option value="12">12 Hours (Urgent)</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours (Low)</option>
              </select>
            </div>

            {/* Priority Override */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priorityOverride}
                onChange={(e) => setPriorityOverride(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Work Instructions
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Inspect asphalt subgrade, seal cracks, and post verification photo."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Dispatching...' : 'Dispatch Specialist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
