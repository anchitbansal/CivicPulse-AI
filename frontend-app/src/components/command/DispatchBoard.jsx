import React from 'react';
import {
  Car,
  Trash,
  Lightbulb,
  Droplets,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import PriorityIndicator from '../common/PriorityIndicator';

export default function DispatchBoard({
  tickets = [],
  onSelectTicket,
  onStatusUpdate,
}) {
  const columns = [
    { id: 'Pending', label: 'Pending', subtitle: 'Awaiting crew assignment', tone: 'red' },
    { id: 'Assigned', label: 'Assigned', subtitle: 'Field worker dispatched', tone: 'amber' },
    { id: 'In Progress', label: 'In Progress', subtitle: 'Active repair in progress', tone: 'blue' },
    { id: 'Resolved', label: 'Resolved', subtitle: 'Verified & closed', tone: 'green' },
  ];

  const getDefectIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'pothole':
        return Car;
      case 'garbage':
        return Trash;
      case 'streetlight':
        return Lightbulb;
      case 'traffic_light':
        return AlertTriangle;
      case 'sewage':
        return Droplets;
      default:
        return AlertCircle;
    }
  };

  const getColumnTickets = (status) => {
    return tickets.filter((t) => t.status === status);
  };

  const nextStatusMap = {
    Pending: 'Assigned',
    Assigned: 'In Progress',
    'In Progress': 'Resolved',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTickets = getColumnTickets(col.id);

        return (
          <div
            key={col.id}
            className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1729] p-3.5 flex flex-col h-full min-h-[500px] transition-colors"
          >
            {/* Column Header */}
            <div className="pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy-900 dark:text-white tracking-wider uppercase">
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-subtle">
                    {colTickets.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{col.subtitle}</p>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {colTickets.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No {col.label.toLowerCase()} tickets
                </div>
              ) : (
                colTickets.map((ticket) => {
                  const DefectIcon = getDefectIcon(ticket.defect_type);
                  const nextStatus = nextStatusMap[ticket.status];

                  return (
                    <div
                      key={ticket._id}
                      onClick={() => onSelectTicket(ticket)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-4 shadow-card dark:shadow-darkCard hover:shadow-elevation dark:hover:shadow-darkElevation hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                    >
                      {/* Card Top: ID and Severity */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                          #{ticket._id?.slice(-5) || 'TICKET'}
                        </span>
                        <SeverityBadge severity={ticket.status === 'Resolved' ? 'RESOLVED' : ticket.severity} size="sm" />
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-start gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#17243A] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                          <DefectIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-navy-900 dark:text-white capitalize group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                            {(ticket.defect_type || 'Civic Issue').replace(/_/g, ' ')}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span className="capitalize">{ticket.zone || 'central'} Zone</span>
                          </p>
                        </div>
                      </div>

                      {/* Priority meter */}
                      <div className="mb-3">
                        <PriorityIndicator score={ticket.priority_score || 0} size="sm" />
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{ticket.report_frequency || 1} reports</span>
                        </span>

                        {nextStatus ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusUpdate(ticket._id, nextStatus);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-cyan-400 hover:text-brand-800 dark:hover:text-cyan-300 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/60 px-2 py-1 rounded transition-colors"
                          >
                            <span>→ {nextStatus}</span>
                          </button>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Closed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
