import React from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  MapPin,
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import EmptyState from '../common/EmptyState';

export default function VerificationView({ tickets = [], onSelectTicket }) {
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');

  if (resolvedTickets.length === 0) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No Resolved Work Orders to Audit"
        description="When incidents are transitioned to 'Resolved', their AI resolution verification audit metrics will be displayed here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-navy-900 dark:text-white">Audited Resolution Archive</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Work orders closed with computer vision SSIM comparison and damage reduction analysis.
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 w-fit">
          {resolvedTickets.length} Audited Resolutions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolvedTickets.map((ticket) => {
          const beforeArea = ticket.before_damage_pct || 0;
          const afterArea = ticket.after_damage_pct || 0;
          const areaReduction = Math.max(0, beforeArea - afterArea);

          return (
            <div
              key={ticket._id}
              onClick={() => onSelectTicket(ticket)}
              className="rounded-xl border border-emerald-200/90 dark:border-emerald-800/80 bg-white dark:bg-[#111C2F] p-5 shadow-card dark:shadow-darkCard hover:shadow-elevation dark:hover:shadow-darkElevation transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                  #{ticket._id?.slice(-6) || 'TICKET'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Closed</span>
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-navy-900 dark:text-white capitalize">{(ticket.defect_type || 'Civic Defect').replace(/_/g, ' ')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{ticket.zone || 'central'} Zone</p>
              </div>

              {/* Damage Delta Comparison */}
              <div className="rounded-lg bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Initial Area</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{beforeArea}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Final Area</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{afterArea}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">Area Delta</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">-{areaReduction}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Priority Was: <strong className="text-navy-900 dark:text-white">{ticket.priority_score || 0}</strong></span>
                <span className="text-brand-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                  <span>Inspect Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
