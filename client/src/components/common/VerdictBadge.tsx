import React from 'react';
import { VerdictType } from '../../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: VerdictType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, showIcon = true, size = 'md' }) => {
  const styles = {
    AUTHENTIC: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm font-bold',
      icon: ShieldCheck,
      text: 'AUTHENTIC'
    },
    SUSPICIOUS: {
      bg: 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm font-bold',
      icon: AlertTriangle,
      text: 'SUSPICIOUS'
    },
    MANIPULATED: {
      bg: 'bg-red-50 border-red-300 text-red-700 shadow-sm font-bold',
      icon: ShieldAlert,
      text: 'MANIPULATED'
    },
    INCONCLUSIVE: {
      bg: 'bg-slate-100 border-slate-300 text-slate-700 shadow-sm font-bold',
      icon: HelpCircle,
      text: 'INCONCLUSIVE'
    }
  };

  const current = styles[verdict] || styles.INCONCLUSIVE;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wide ${current.bg} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {current.text}
    </span>
  );
};
