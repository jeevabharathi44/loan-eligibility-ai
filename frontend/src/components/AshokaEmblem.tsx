import React from 'react';

interface AshokaEmblemProps {
  className?: string;
  size?: number;
}

export const AshokaEmblem: React.FC<AshokaEmblemProps> = ({ className = '', size = 52 }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-amber-500/90"
      >
        {/* Ashoka Pillar Lion Capital stylized vector representation */}
        <path
          d="M50 8C43 8 36 14 36 22C36 27 39 31 43 33C37 36 32 42 32 50C32 58 37 64 43 67C39 69 36 73 36 78C36 84 41 89 47 91L47 94L30 94C28 94 26 96 26 98C26 100 28 102 30 102L70 102C72 102 74 100 74 98C74 96 72 94 70 94L53 94L53 91C59 89 64 84 64 78C64 73 61 69 57 67C63 64 68 58 68 50C68 42 63 36 57 33C61 31 64 27 64 22C64 14 57 8 50 8Z"
          fill="currentColor"
        />
        {/* Ashoka Chakra Wheel */}
        <circle cx="50" cy="98" r="3.5" stroke="#0f172a" strokeWidth="1" fill="#38bdf8" />
        <circle cx="50" cy="50" r="6" stroke="#0f172a" strokeWidth="1.2" fill="#38bdf8" />
        {/* Center Lion Details */}
        <circle cx="46" cy="20" r="1.5" fill="#0f172a" />
        <circle cx="54" cy="20" r="1.5" fill="#0f172a" />
        <path d="M47 24C49 26 51 26 53 24" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="text-[10px] font-serif font-bold text-amber-500/90 tracking-widest uppercase mt-0.5">
        सत्यमेव जयते
      </span>
      <span className="text-[9px] text-slate-400 font-medium">GOVERNMENT OF INDIA</span>
    </div>
  );
};
