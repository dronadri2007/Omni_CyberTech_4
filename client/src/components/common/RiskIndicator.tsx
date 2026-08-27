import React from 'react';
import { RiskLevel } from '../../types';

interface RiskIndicatorProps {
  risk: RiskLevel;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ risk }) => {
  const config = {
    LOW: { color: 'text-emerald-400', bg: 'bg-emerald-400', label: 'LOW RISK' },
    MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-400', label: 'MEDIUM RISK' },
    HIGH: { color: 'text-red-400', bg: 'bg-red-400', label: 'HIGH RISK' },
    CRITICAL: { color: 'text-purple-400', bg: 'bg-purple-400', label: 'CRITICAL RISK' },
  };

  const current = config[risk] || config.LOW;

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.bg} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${current.bg}`}></span>
      </span>
      <span className={`text-xs font-mono font-bold tracking-wider ${current.color}`}>
        {current.label}
      </span>
    </div>
  );
};
