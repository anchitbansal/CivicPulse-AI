import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  MapPin,
  Compass,
  FileCheck2,
  Copy,
  Activity,
  PlusCircle,
} from 'lucide-react';
import Modal from '../common/Modal';
import SeverityBadge from '../common/SeverityBadge';
import PriorityIndicator from '../common/PriorityIndicator';

export default function AIAnalysisResultModal({ isOpen, onClose, result, onReset }) {
  if (!result || !result.ticket) return null;

  const { ticket, merged, message } = result;
  const isMerged = Boolean(merged);
  const coords = ticket.location?.coordinates || [-73.9867, 40.7306];
  const lng = coords[0];
  const lat = coords[1];
  const confidencePct = ticket.confidence ? Math.round(ticket.confidence * 100) : 80;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isMerged ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'}`}>
            {isMerged ? <Layers className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-800/60">
                AI Vision Verified
              </span>
              {isMerged && (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                  15m Spatial Merge
                </span>
              )}
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              {isMerged ? 'Report Consolidated into Existing Ticket' : 'Incident Logged & Triaged Successfully'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {message || (isMerged ? 'A nearby report of this defect already exists. Your report boosted its priority.' : 'Your report was analyzed by YOLOv8 and added to the dispatch board.')}
            </p>
          </div>
        </div>

        {/* Ticket ID & Status Banner */}
        <div className="rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200/90 dark:border-slate-700 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Ticket Identifier</span>
            <div className="font-mono text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <span>#{ticket._id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-transparent dark:border-blue-800">
              {ticket.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* AI Analysis Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A]">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">Defect Type</span>
            <p className="mt-1 font-bold text-sm text-navy-900 dark:text-white capitalize">{(ticket.defect_type || 'Unknown').replace(/_/g, ' ')}</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A]">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">AI Confidence</span>
            <p className="mt-1 font-bold text-sm text-brand-600 dark:text-cyan-400 font-mono">{confidencePct}%</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A]">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">Damage Area</span>
            <p className="mt-1 font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">{ticket.before_damage_pct || 0}%</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A]">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">Severity</span>
            <div className="mt-1">
              <SeverityBadge severity={ticket.severity || 'LOW'} size="sm" />
            </div>
          </div>
        </div>

        {/* Priority Score Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">Automated Priority Rating</span>
            <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">{ticket.priority_score || 0} / 100</span>
          </div>
          <PriorityIndicator score={ticket.priority_score || 0} showLabel={false} size="md" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Calculated from defect impact weight, estimated damage pixels, and confidence metrics.
          </p>
        </div>

        {/* Location Details */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#17243A]/60 p-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600 dark:text-cyan-400 shrink-0" />
            <span>
              Coordinates: <strong className="font-mono text-slate-800 dark:text-slate-200">{lat.toFixed(4)}, {lng.toFixed(4)}</strong> ({ticket.zone || 'central'} zone)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Compass className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Reports: <strong className="text-navy-900 dark:text-white">{ticket.report_frequency || 1}</strong></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#17243A] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E2D4F] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Another</span>
          </button>

          {ticket._id && !ticket._id.toString().startsWith('fallback') && (
            <Link
              to={`/citizen/issues/${ticket._id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-subtle"
            >
              <span>Track Complaint</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          )}

          <Link
            to="/command-center"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 dark:bg-brand-600 text-white text-xs font-semibold hover:bg-navy-900 dark:hover:bg-brand-500 transition-colors shadow-subtle"
          >
            <Activity className="w-4 h-4 text-cyan-400 dark:text-white" />
            <span>Command Center</span>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
