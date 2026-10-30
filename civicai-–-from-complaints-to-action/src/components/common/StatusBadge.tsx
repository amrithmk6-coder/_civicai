import React from 'react';
import { ComplaintStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Send } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const configs: Record<
    ComplaintStatus,
    { icon: React.ReactNode; text: string; bg: string; border: string; dot: string }
  > = {
    Submitted: {
      icon: <Send className="w-3 h-3 text-slate-500" />,
      text: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
    'Under Review': {
      icon: <AlertCircle className="w-3 h-3 text-indigo-600" />,
      text: 'text-indigo-800',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    },
    Assigned: {
      icon: <Clock className="w-3 h-3 text-amber-600" />,
      text: 'text-amber-800',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    'In Progress': {
      icon: <RefreshCw className="w-3 h-3 text-teal-600 animate-spin" />,
      text: 'text-teal-800',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
    },
    Resolved: {
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
      text: 'text-emerald-800',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  const current = configs[status] || configs.Submitted;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${current.bg} ${current.border} ${current.text} ${sizeClasses[size]}`}
    >
      {showIcon ? (
        current.icon
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      )}
      <span>{status}</span>
    </span>
  );
};
