import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'blue',
  trend,
  className = '',
}) {
  const toneMap = {
    navy: {
      card: 'bg-white dark:bg-[#111C2F] border-slate-200/90 dark:border-slate-800 text-navy-800 dark:text-white',
      iconBox: 'bg-navy-50 dark:bg-navy-900/60 text-navy-800 dark:text-cyan-400 border-navy-100 dark:border-navy-700',
    },
    blue: {
      card: 'bg-white dark:bg-[#111C2F] border-slate-200/90 dark:border-slate-800 text-navy-800 dark:text-white',
      iconBox: 'bg-blue-50 dark:bg-blue-950/50 text-brand-600 dark:text-brand-400 border-blue-100 dark:border-blue-800',
    },
    critical: {
      card: 'bg-white dark:bg-[#111C2F] border-slate-200/90 dark:border-slate-800 text-navy-800 dark:text-white',
      iconBox: 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
    },
    warning: {
      card: 'bg-white dark:bg-[#111C2F] border-slate-200/90 dark:border-slate-800 text-navy-800 dark:text-white',
      iconBox: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    },
    success: {
      card: 'bg-white dark:bg-[#111C2F] border-slate-200/90 dark:border-slate-800 text-navy-800 dark:text-white',
      iconBox: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    },
  };

  const style = toneMap[tone] || toneMap.blue;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 shadow-card dark:shadow-darkCard hover:shadow-elevation dark:hover:shadow-darkElevation transition-all duration-200 ${style.card} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${style.iconBox}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{value}</span>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}
