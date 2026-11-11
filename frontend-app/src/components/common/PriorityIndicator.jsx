import React from 'react';

export default function PriorityIndicator({ score = 0, showLabel = true, size = 'md', className = '' }) {
  const numScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  let colorClass = 'bg-blue-500 dark:bg-blue-400';
  let badgeBg = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';

  if (numScore >= 75) {
    colorClass = 'bg-red-500 dark:bg-red-400';
    badgeBg = 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
  } else if (numScore >= 45) {
    colorClass = 'bg-amber-500 dark:bg-amber-400';
    badgeBg = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border ${badgeBg}`}>
          P-{numScore}
        </span>
      )}
      <div className={`flex-1 bg-slate-200/80 dark:bg-slate-750 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5 min-w-[40px]' : 'h-2 min-w-[60px]'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${numScore}%` }}
        />
      </div>
    </div>
  );
}
