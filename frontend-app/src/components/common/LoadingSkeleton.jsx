import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 3, className = '' }) {
  if (type === 'card') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-4 shadow-subtle animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-5 shadow-subtle animate-pulse space-y-3">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
    </div>
  );
}
