import React from 'react';

export const MeriPehchaanBrand: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Radiant Sun Icon & Branding */}
      <div className="flex items-center gap-3">
        {/* Multi-color Radiant Sun Logo */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
            <defs>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Sun Rays */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="12"
                x2="50"
                y2="2"
                stroke="url(#sunGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            {/* Center radiant disc */}
            <circle cx="50" cy="50" r="28" fill="url(#sunGrad)" />
            <circle cx="50" cy="50" r="21" fill="#ffffff" />
            <circle cx="50" cy="50" r="14" fill="#0284c7" />
          </svg>
        </div>

        {/* Brand Text */}
        <div className="text-left">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-ink font-sans">
              मेरी <span className="text-orange-600">पहचान</span>
            </span>
            <span className="text-xs font-bold text-mute">| Meri Pehchaan</span>
          </div>
          <p className="text-[10px] tracking-widest font-bold text-cy uppercase">
            National Single Sign-On Service
          </p>
        </div>
      </div>

      {/* Partner Badges: DigiLocker, ई-प्रमाण, जनPARICHAY */}
      {!compact && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-line w-full">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-700">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            DigiLocker
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ई-प्रमाण (e-Pramaan)
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200 text-[11px] font-semibold text-orange-700">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            जनPARICHAY
          </div>
        </div>
      )}
    </div>
  );
};
