import React from 'react';
import { Radio, AlertCircle, ArrowRight, CheckCircle2, Clock, MapPin, Zap } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';

export default function ActivityFeed({ events = [], isConnected = true, onSelectTicket }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] shadow-card dark:shadow-darkCard overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#17243A]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white">
            Live Dispatch Wire
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className={isConnected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
            {isConnected ? 'STREAMING' : 'CONNECTING'}
          </span>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-1">
        {events.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 dark:text-slate-500">
            <Radio className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 animate-pulse" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Awaiting Incident Signals</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] mx-auto">
              Real-time events will stream here as citizen reports are submitted.
            </p>
          </div>
        ) : (
          events.slice(0, 15).map((evt, idx) => {
            const isResolved = evt.type === 'RESOLVED' || evt.ticket?.status === 'Resolved';

            return (
              <div
                key={evt.id || idx}
                onClick={() => evt.ticket && onSelectTicket && onSelectTicket(evt.ticket)}
                className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#17243A] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-navy-900 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                    #{evt.ticket?._id?.slice(-5) || 'EVENT'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {evt.timeAgo || 'Just now'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-navy-900 dark:text-white capitalize flex items-center gap-1.5">
                    {isResolved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-cyan-400" />
                    )}
                    <span>{(evt.ticket?.defect_type || 'Civic Defect').replace(/_/g, ' ')}</span>
                  </div>
                  <SeverityBadge severity={evt.ticket?.severity || 'LOW'} size="sm" />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="capitalize">{evt.ticket?.zone || 'central'} Zone • P-{evt.ticket?.priority_score || 0}</span>
                  <span className="text-brand-600 dark:text-cyan-400 font-medium group-hover:underline flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#17243A] text-[10px] text-slate-500 dark:text-slate-400 text-center">
        Socket.IO room active • WebSocket connected
      </div>
    </div>
  );
}
