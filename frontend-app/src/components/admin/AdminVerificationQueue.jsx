import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  API_BASE,
} from '../../services/api';

export default function AdminVerificationQueue() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadQueue = async () => {
    try {
      const data = await getPendingVerifications();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load pending verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (ticketId) => {
    setActionInProgress(true);
    try {
      await approveVerification(ticketId, 'Inspected and verified by Municipal Administrator.');
      await loadQueue();
    } catch (err) {
      alert(err.message || 'Failed to approve resolution');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    setActionInProgress(true);
    try {
      await rejectVerification(rejectingId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      await loadQueue();
    } catch (err) {
      alert(err.message || 'Failed to reject resolution');
    } finally {
      setActionInProgress(false);
    }
  };

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            Resolution Verification & Signoff Queue
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review before-and-after photographic proof submitted by field technicians. Approving officially closes the complaint; rejecting reopens the task for remediation.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
            Loading verification queue...
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No tasks currently pending verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              All technician repair submissions have been audited. New submissions will appear here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        #{ticket._id.toString().slice(-6)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                        PENDING VERIFICATION
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500">
                        {ticket.defect_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                      {ticket.title || ticket.defect_type}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {ticket.location?.address || ticket.location?.ward || 'Central Ward'}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Submitted by Specialist:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {ticket.assigned_worker_id?.name || 'Field Technician'}
                    </span>{' '}
                    ({ticket.assigned_worker_id?.department || 'Public Works'})
                  </div>
                </div>

                {/* Side-by-side Before & After Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Initial Defect Photo
                    </span>
                    <div className="h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {ticket.before_image_url ? (
                        <img
                          src={formatImageUrl(ticket.before_image_url)}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">No before photo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Damage: {ticket.before_damage_pct || 0}% • Severity: {ticket.severity}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                      Technician Repair Proof Photo
                    </span>
                    <div className="h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-emerald-500/40">
                      {ticket.after_image_url || ticket.resolution_proof?.images?.[0] ? (
                        <img
                          src={formatImageUrl(
                            ticket.after_image_url || ticket.resolution_proof?.images?.[0]
                          )}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">No proof photo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{ticket.resolution_proof?.completion_notes || 'Repairs completed.'}"
                    </div>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={actionInProgress}
                    onClick={() => {
                      setRejectingId(ticket._id);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject & Reopen Task
                  </button>

                  <button
                    type="button"
                    disabled={actionInProgress}
                    onClick={() => handleApprove(ticket._id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Resolution (Close Issue)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectingId && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111C2F] max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                Reject Proof & Reopen Task
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please specify the reason for rejecting the repair proof. This feedback will be sent directly to the technician.
              </p>

              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Surface patch uneven; asphalt edges not sealed..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionInProgress || !rejectReason.trim()}
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm Reopen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
