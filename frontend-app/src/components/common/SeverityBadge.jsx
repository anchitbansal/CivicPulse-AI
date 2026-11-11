import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function SeverityBadge({ severity = 'LOW', size = 'md', className = '' }) {
  const norm = String(severity).toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40',
      icon: AlertCircle,
      label: 'Critical',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40',
      icon: AlertTriangle,
      label: 'Medium',
    },
    LOW: {
      bg: 'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40',
      icon: Info,
      label: 'Low',
    },
    RESOLVED: {
      bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40',
      icon: CheckCircle2,
      label: 'Resolved',
    },
  }[norm] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: Info,
    label: norm,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider ${config.bg} ${sizeClasses} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
