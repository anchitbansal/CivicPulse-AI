import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import PriorityIndicator from '../common/PriorityIndicator';

export default function IncidentDrawer({ ticket, isOpen, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !ticket) return null;

  const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
  const currentIndex = statuses.indexOf(ticket.status || 'Pending');
  const coords = ticket.location?.coordinates || [-73.9867, 40.7306];
  const lng = coords[0];
  const lat = coords[1];
  const confidencePct = ticket.confidence ? Math.round(ticket.confidence * 100) : 80;

  const handleStatusChange = async (nextStatus) => {
    if (updating || nextStatus === ticket.status) return;
    setUpdating(true);
    try {
      await onStatusUpdate(ticket._id, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#111C2F] border-l border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col transition-colors">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#17243A] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-cyan-400">
                  #{ticket._id}
                </span>
                <SeverityBadge severity={ticket.status === 'Resolved' ? 'RESOLVED' : ticket.severity} size="sm" />
              </div>
              <h2 className="text-lg font-extrabold text-navy-900 dark:text-white capitalize">
                {(ticket.defect_type || 'Civic Defect').replace(/_/g, ' ')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zone: <strong className="capitalize text-slate-700 dark:text-slate-200">{ticket.zone || 'central'}</strong> • Reports: <strong className="text-navy-900 dark:text-white">{ticket.report_frequency || 1}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Flow Stepper */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white mb-2">
                Workflow Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((st, idx) => {
                  const isCurrent = ticket.status === st;
                  const isPast = currentIndex > idx;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange(st)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-cyan-400 ring-1 ring-brand-500'
                          : isPast
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#17243A] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17243A]/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span>{st}</span>
                      {isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              {updating && (
                <div className="mt-2 text-xs text-brand-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Updating status on backend...</span>
                </div>
              )}
            </div>

            {/* AI Scoring Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A] p-4 space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
                  <span>AI Triage Diagnostics</span>
                </span>
                <span className="text-xs font-mono font-bold text-navy-900 dark:text-white">Score: {ticket.priority_score || 0}/100</span>
              </div>

              <PriorityIndicator score={ticket.priority_score || 0} showLabel={false} />

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Model Confidence</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{confidencePct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Damage Area</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{ticket.before_damage_pct || 0}%</span>
                </div>
              </div>
            </div>

            {/* Resolution Verification Data if Resolved */}
            {ticket.status === 'Resolved' && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Resolution Verification Audit</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Backend verified repair state using SSIM structural comparison and damage area delta.
                </p>
                <div className="pt-2 grid grid-cols-2 gap-2 border-t border-emerald-200 dark:border-emerald-800 text-xs">
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-semibold">Before Damage</span>
                    <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{ticket.before_damage_pct || 0}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-semibold">Residual Damage</span>
                    <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{ticket.after_damage_pct || 0}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Coordinates */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#17243A]/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                <span>Geospatial Coordinates</span>
              </div>
              <div className="font-mono text-xs text-navy-900 dark:text-white bg-white dark:bg-[#111C2F] p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Indexed in MongoDB using 2dsphere index for radial proximity searches.
              </p>
            </div>

            {/* Incident Metadata */}
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span>Citizen Upvotes:</span>
                <span className="font-bold text-navy-900 dark:text-white">{ticket.upvote_count || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Report Frequency:</span>
                <span className="font-bold text-navy-900 dark:text-white">{ticket.report_frequency || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created At:</span>
                <span className="font-mono">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#17243A] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Advance to next stage:
            </span>
            {currentIndex < statuses.length - 1 ? (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange(statuses[currentIndex + 1])}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 dark:bg-brand-600 text-white text-xs font-semibold hover:bg-navy-900 dark:hover:bg-brand-500 transition-colors shadow-subtle"
              >
                <span>Move to {statuses[currentIndex + 1]}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 dark:text-white" />
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Workflow Complete</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
