import React from 'react';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, label, size = 'md', inverted = false }) => {
  const isHighRisk = inverted ? score >= 75 : score <= 25;
  const isMedRisk = inverted ? (score >= 45 && score < 75) : (score > 25 && score <= 60);

  const strokeColor = isHighRisk ? '#dc2626' : isMedRisk ? '#d97706' : '#16a34a';
  const glowColor = isHighRisk ? 'shadow-red-500/15' : isMedRisk ? 'shadow-amber-500/15' : 'shadow-emerald-500/15';

  const radius = size === 'xl' ? 54 : size === 'lg' ? 42 : size === 'md' ? 32 : 20;
  const strokeWidth = size === 'xl' ? 10 : size === 'lg' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const containerSizes = {
    sm: 'w-14 h-14 text-sm',
    md: 'w-20 h-20 text-lg',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-44 h-44 text-4xl',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center rounded-full ${containerSizes[size]} ${glowColor} shadow-lg bg-white border border-slate-200`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute font-mono font-extrabold tracking-tighter" style={{ color: strokeColor }}>
          {score}%
        </span>
      </div>
      {label && <span className="mt-2 text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">{label}</span>}
    </div>
  );
};
