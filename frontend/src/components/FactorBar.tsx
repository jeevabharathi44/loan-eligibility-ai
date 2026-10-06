import React from 'react';
import { PredictionFactor } from '../types';

interface FactorBarProps {
  factor: PredictionFactor;
  maxScale?: number;
}

export const FactorBar: React.FC<FactorBarProps> = ({ factor, maxScale = 2.4 }) => {
  const v = factor.contribution;
  const isPositive = v >= 0;
  const absV = Math.abs(v);
  const widthPercent = Math.min(50, (absV / maxScale) * 50);
  const leftPercent = isPositive ? 50 : 50 - widthPercent;

  return (
    <div className="py-3 border-t border-line/60">
      <div className="flex justify-between items-baseline gap-2 mb-2">
        <p className="text-xs sm:text-sm text-ink leading-snug">
          {factor.explanation}
        </p>
        <span
          className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
            isPositive
              ? 'bg-ok/10 text-ok border border-ok/20'
              : 'bg-bad/10 text-bad border border-bad/20'
          }`}
        >
          {isPositive ? `+${v.toFixed(2)}` : v.toFixed(2)}
        </span>
      </div>

      <div className={`factor-bar ${isPositive ? 'up' : 'dn'}`}>
        <i
          style={{
            width: `${widthPercent}%`,
            left: `${leftPercent}%`,
          }}
        />
      </div>
    </div>
  );
};
