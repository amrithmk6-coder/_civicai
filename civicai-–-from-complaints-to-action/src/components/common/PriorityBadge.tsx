import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showDot = true,
}) => {
  const configs: Record<
    PriorityLevel,
    { dot: string; text: string; bg: string; border: string }
  > = {
    Critical: {
      dot: 'bg-rose-500 animate-pulse',
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    High: {
      dot: 'bg-amber-500',
      text: 'text-amber-800',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    Medium: {
      dot: 'bg-blue-500',
      text: 'text-blue-800',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    Low: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-800',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
  };

  const current = configs[priority] || configs.Medium;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${current.bg} ${current.border} ${current.text} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${current.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{priority}</span>
    </span>
  );
};
