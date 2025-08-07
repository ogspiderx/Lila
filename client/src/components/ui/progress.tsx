import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  showText?: boolean;
}

export function Progress({ value, className = "", showText = false }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showText && (
        <div className="text-center text-xs text-slate-400 mt-1">
          {Math.round(clampedValue)}% loaded
        </div>
      )}
    </div>
  );
}