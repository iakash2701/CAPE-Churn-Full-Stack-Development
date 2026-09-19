import React from 'react';

interface BadgeProps {
  level: 'Low Risk' | 'Medium Risk' | 'High Risk' | string;
  className?: string;
}

export function RiskBadge({ level, className = '' }: BadgeProps) {
  let style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (level === 'High Risk' || level === 'High') {
    style = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (level === 'Medium Risk' || level === 'Medium') {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        level === 'High Risk' || level === 'High' ? 'bg-rose-400' : level === 'Medium Risk' || level === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
      }`}></span>
      {level}
    </span>
  );
}
