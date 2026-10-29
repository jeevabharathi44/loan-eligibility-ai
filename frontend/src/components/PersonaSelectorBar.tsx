import React from 'react';
import { UserCheck, AlertCircle, XCircle, Shield, Sparkles } from 'lucide-react';

interface PersonaSelectorBarProps {
  activePersonaId?: string;
  onSelectPersona: (personaId: string) => void;
  onNavigateToCockpit?: () => void;
}

export const PersonaSelectorBar: React.FC<PersonaSelectorBarProps> = ({
  activePersonaId,
  onSelectPersona,
  onNavigateToCockpit,
}) => {
  return (
    <div className="w-full bg-white/90 border-b border-sky-100 px-4 py-2.5 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Viva Test Benchmarks
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            1-Click Benchmark Personas (RBI Lending Guidelines Test Matrix):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Persona 1: Jeeva Bharathi M */}
          <button
            type="button"
            onClick={() => onSelectPersona('jeeva_bharathi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activePersonaId === 'jeeva_bharathi'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Jeeva Bharathi M</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-200 font-mono">
              Prime 785
            </span>
          </button>

          {/* Persona 2: Jeeva B */}
          <button
            type="button"
            onClick={() => onSelectPersona('jeeva_b')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activePersonaId === 'jeeva_b'
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Jeeva B</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded border border-amber-200 font-mono">
              Near-Prime 662
            </span>
          </button>

          {/* Persona 3: Karthik Raman */}
          <button
            type="button"
            onClick={() => onSelectPersona('karthik_raman')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activePersonaId === 'karthik_raman'
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>3. Karthik Raman</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded border border-rose-200 font-mono">
              Subprime 535
            </span>
          </button>

          {/* Officer Cockpit Button */}
          {onNavigateToCockpit && (
            <button
              type="button"
              onClick={onNavigateToCockpit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50/70 text-amber-800 border border-amber-200 hover:bg-amber-100/70 transition-colors ml-1 shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Dr. Varman Cockpit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
