import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Star,
  ThumbsDown,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { getTicketById, submitCitizenFeedback, API_BASE } from '../../services/api';
import { subscribeToTicketUpdates } from '../../services/socket';

export default function CitizenComplaintDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [reopenReason, setReopenReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        console.error('Failed to load ticket:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();

    // Subscribe to live ticket updates
    const unsubscribe = subscribeToTicketUpdates(id, (eventData) => {
      if (eventData.ticket) {
        setTicket(eventData.ticket);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleFeedbackSubmit = async (isSatisfied, requestReopen = false) => {
    setSubmittingFeedback(true);
    try {
      const res = await submitCitizenFeedback(id, {
        rating: feedbackRating,
        is_satisfied: isSatisfied,
        reopen_requested: requestReopen,
        reopen_reason: reopenReason,
      });
      setFeedbackSuccess(res.message);
      setShowDisputeModal(false);
      const updated = await getTicketById(id);
      setTicket(updated);
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const steps = [
    { label: 'Reported', key: 'REPORTED', desc: 'AI Defect Analysis' },
    { label: 'Assigned', key: 'ASSIGNED', desc: 'Crew Dispatched' },
    { label: 'In Progress', key: 'IN_PROGRESS', desc: 'Repairs Active' },
    { label: 'Pending Verification', key: 'PENDING_VERIFICATION', desc: 'Proof Submitted' },
    { label: 'Resolved', key: 'RESOLVED', desc: 'Officially Verified' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'REPORTED':
      case 'Pending':
        return 0;
      case 'ASSIGNED':
      case 'Assigned':
        return 1;
      case 'IN_PROGRESS':
      case 'In Progress':
        return 2;
      case 'PENDING_VERIFICATION':
        return 3;
      case 'RESOLVED':
      case 'Resolved':
        return 4;
      case 'REOPENED':
        return 2;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex items-center justify-center p-6 text-slate-400">
        <div className="text-center space-y-2">
          <Clock className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-sm">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex items-center justify-center p-6 text-slate-400">
        <div className="text-center space-y-4">
          <p className="text-base text-slate-200">Complaint not found.</p>
          <Link
            to="/citizen/issues"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Complaints
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(ticket.status);
  const isReopened = ticket.status === 'REOPENED';
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'Resolved';

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/citizen/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Complaints
        </Link>

        {/* Complaint Header Banner */}
        <div className="bg-white dark:bg-[#111C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  ID: #{ticket._id.toString().slice(-8)}
                </span>
                {isReopened ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    REOPENED / DISPUTED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {ticket.status}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {ticket.title || ticket.defect_type?.replace('_', ' ').toUpperCase()}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {ticket.location?.address || ticket.location?.ward || 'Central Ward'}
              </p>
            </div>

            {/* If resolved, show Citizen Verification / Dispute button */}
            {isResolved && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  Dispute Resolution
                </button>
              </div>
            )}
          </div>

          {/* Stepper Progress */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {steps.map((s, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div
                    key={s.key}
                    className={`p-3 rounded-xl border text-center transition ${
                      isCurrent
                        ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-sm'
                        : isPassed
                        ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-transparent border-slate-200/50 dark:border-slate-800/50 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-400 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Success message banner */}
        {feedbackSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {feedbackSuccess}
          </div>
        )}

        {/* Images and Evidence Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Photo */}
          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Initial Reported Defect
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono">
                {ticket.defect_type}
              </span>
            </div>
            <div className="h-56 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {ticket.before_image_url ? (
                <img
                  src={formatImageUrl(ticket.before_image_url)}
                  alt="Defect before repair"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> No before image uploaded
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded bg-slate-50 dark:bg-[#17243A]">
                <div className="text-[10px] text-slate-400">Damage</div>
                <div className="font-bold">{ticket.before_damage_pct || 0}%</div>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-[#17243A]">
                <div className="text-[10px] text-slate-400">Severity</div>
                <div className="font-bold">{ticket.severity}</div>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-[#17243A]">
                <div className="text-[10px] text-slate-400">AI Confidence</div>
                <div className="font-bold">{Math.round((ticket.confidence || 0.85) * 100)}%</div>
              </div>
            </div>
          </div>

          {/* After Proof Photo */}
          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Field Completion Proof
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">
                {ticket.resolution_proof?.submitted_at ? 'Proof Submitted' : 'Pending Field Work'}
              </span>
            </div>
            <div className="h-56 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {ticket.after_image_url || ticket.resolution_proof?.images?.[0] ? (
                <img
                  src={formatImageUrl(ticket.after_image_url || ticket.resolution_proof?.images?.[0])}
                  alt="Defect after repair"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-1 text-center p-4">
                  <Clock className="w-5 h-5 text-slate-500 mb-1" />
                  <span>Field crew currently deployed.</span>
                  <span className="text-[10px] text-slate-400">Proof photo will appear once submitted.</span>
                </div>
              )}
            </div>
            <div className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-[#17243A] text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                Crew Resolution Notes:
              </span>
              {ticket.resolution_proof?.completion_notes || 'Pending technician repair notes.'}
            </div>
          </div>
        </div>

        {/* Assigned Field Crew & Audit Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crew Info */}
          <div className="bg-white dark:bg-[#111C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-500" />
              Assigned Field Specialist
            </h3>
            {ticket.assigned_worker_id ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#17243A] flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base">
                  {ticket.assigned_worker_id.name?.[0] || 'W'}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {ticket.assigned_worker_id.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {ticket.assigned_worker_id.department || 'Municipal Public Works'}
                  </div>
                  <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">
                    Field Team Dispatched
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#17243A] text-slate-500 text-xs">
                In triage queue. Awaiting dispatch to ward field specialist.
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white dark:bg-[#111C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Official Audit Trail
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {(!ticket.history || ticket.history.length === 0) ? (
                <div className="text-slate-400 text-xs">No audit logs recorded.</div>
              ) : (
                ticket.history.map((h, i) => (
                  <div key={i} className="text-xs border-l-2 border-blue-500 pl-3 py-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {h.action?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      by <span className="font-semibold text-slate-700 dark:text-slate-300">{h.performed_by_name}</span> ({h.performed_by_role})
                    </div>
                    {h.notes && <div className="text-slate-600 dark:text-slate-300 italic">"{h.notes}"</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dispute / Reopen Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111C2F] max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                Dispute Resolution & Reopen Complaint
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                If the civic issue has not been satisfactorily repaired or has recurred, submitting this dispute will notify the municipal administrator and return the complaint to the field queue.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Dispute / Reopening:
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Describe why the repair is incomplete..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingFeedback || !reopenReason.trim()}
                  onClick={() => handleFeedbackSubmit(false, true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {submittingFeedback ? 'Submitting...' : 'Confirm Dispute & Reopen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
