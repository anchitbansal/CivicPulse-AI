import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No incidents found',
  description = 'No active records match the current filter criteria.',
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111C2F]/50 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-white dark:bg-[#17243A] shadow-subtle border border-slate-200 dark:border-slate-750 flex items-center justify-center text-slate-400 dark:text-slate-300 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-navy-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
