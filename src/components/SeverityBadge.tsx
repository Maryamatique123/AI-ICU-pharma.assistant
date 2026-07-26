import React from 'react';
import { SeverityLevel } from '../types';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = true,
  className = ''
}) => {
  const getStyles = () => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
          icon: AlertOctagon,
          dotBg: 'bg-red-600'
        };
      case 'High':
        return {
          bg: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          icon: AlertTriangle,
          dotBg: 'bg-orange-600'
        };
      case 'Moderate':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: ShieldAlert,
          dotBg: 'bg-blue-600'
        };
      case 'Low':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: Info,
          dotBg: 'bg-slate-600'
        };
    }
  };

  const style = getStyles();
  const IconComponent = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      <span>{severity} Severity</span>
    </span>
  );
};
