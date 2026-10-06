import React from 'react';

interface CibilGaugeProps {
  score: number;
  paymentHistory?: number;
  creditUtilization?: number;
  creditHistoryYears?: number;
  recentEnquiries?: number;
  showConsistencyCheck?: boolean;
}

export const CibilGauge: React.FC<CibilGaugeProps> = ({
  score,
  paymentHistory = 85,
  creditUtilization = 30,
  creditHistoryYears = 5,
  recentEnquiries = 1,
  showConsistencyCheck = true,
}) => {
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const validScore = clamp(score, 300, 900);
  const markerPercent = ((validScore - 300) / 600) * 100;

  const getBand = (s: number): { label: string; colorClass: string; tier: string } => {
    if (s >= 750) return { label: 'Excellent', colorClass: 'ok', tier: 'Prime' };
    if (s >= 650) return { label: 'Good', colorClass: 'ok', tier: 'Near Prime' };
    if (s >= 550) return { label: 'Fair', colorClass: 'mid', tier: 'Subprime' };
    return { label: 'Poor', colorClass: 'bad', tier: 'High Risk' };
  };

  const band = getBand(validScore);

  // Estimate expected score from habits
  const payNorm = clamp(paymentHistory, 0, 100) / 100;
  const utilNorm = clamp(creditUtilization, 0, 100) / 100;
  const yrsNorm = clamp(creditHistoryYears, 0, 20) / 20;
  const enqNorm = clamp(recentEnquiries, 0, 10) / 10;
  const estimatedScore = Math.round(
    300 + 600 * (0.35 * payNorm + 0.3 * (1 - utilNorm) + 0.15 * yrsNorm + 0.2 * (1 - enqNorm))
  );

  const diff = Math.abs(validScore - estimatedScore);

  let consistencyMsg = '';
  if (diff <= 65) {
    consistencyMsg = `Consistent: your credit habits point to about ${estimatedScore}, close to the score of ${validScore}.`;
  } else if (validScore > estimatedScore) {
    consistencyMsg = `Notice: your habits point to about ${estimatedScore}, below the declared ${validScore}. Recent defaults or high utilization may lower actual score.`;
  } else {
    consistencyMsg = `Notice: your habits point to about ${estimatedScore}, higher than the declared ${validScore}. Old bureau records or hard enquiries may be pulling it down.`;
  }

  return (
    <div className="w-full my-4">
      {/* Gauge bar */}
      <div className="gauge my-3">
        <div className="gbar">
          <i style={{ left: `calc(${markerPercent}% - 2px)` }} />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-dim mt-2">
          <span>300 (Poor)</span>
          <span>550 (Fair)</span>
          <span>650 (Good)</span>
          <span>750 (Excellent)</span>
          <span>900</span>
        </div>
      </div>

      {showConsistencyCheck && (
        <div className={`chk ${band.colorClass} mt-4`}>
          <div className="flex items-center justify-between">
            <strong className="text-base font-bold">
              {band.label} Score: {validScore}
            </strong>
            <span className="text-xs px-2 py-0.5 rounded-full bg-field border border-line text-mute">
              {band.tier}
            </span>
          </div>
          <p className="text-xs text-mute mt-1.5 leading-relaxed">{consistencyMsg}</p>
        </div>
      )}
    </div>
  );
};
