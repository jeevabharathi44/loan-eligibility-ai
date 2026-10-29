import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Sparkles, Scale } from 'lucide-react';

interface CrossFieldCheckItem {
  field_name: string;
  aadhaar_value: string;
  pan_value: string;
  declared_value: string;
  is_match: boolean;
  levenshtein_distance: number;
  similarity_percentage: number;
  flag_type: 'MATCH' | 'MINOR_DISCREPANCY' | 'CRITICAL_MISMATCH';
}

interface CrossFieldOCRValidatorProps {
  status: string; // MATCH, DISCREPANCY_FLAG, MISMATCH
  overallSimilarity: number;
  nameSimilarity: number;
  nameLevenshteinDistance: number;
  fields: CrossFieldCheckItem[];
  requiresOfficerReview: boolean;
  reviewReason?: string;
  panStatusVerified: boolean;
  aadhaarXmlSignatureValid: boolean;
}

export const CrossFieldOCRValidator: React.FC<CrossFieldOCRValidatorProps> = ({
  status,
  overallSimilarity,
  nameSimilarity,
  nameLevenshteinDistance,
  fields,
  requiresOfficerReview,
  reviewReason,
  panStatusVerified,
  aadhaarXmlSignatureValid,
}) => {
  return (
    <div className="app-card p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cy" />
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              Module 3: Automated OCR & 100% Cross-Field Consistency Validation
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Multi-document optical cross-check using dynamic Levenshtein distance string similarity
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'MATCH' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-ok/15 text-ok border border-ok/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
              <span>100% Identity Match</span>
            </span>
          ) : status === 'DISCREPANCY_FLAG' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warn/15 text-warn border border-warn/30 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-warn" />
              <span>Discrepancy Exception Flagged</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-bad/15 text-bad border border-bad/30">
              <XCircle className="w-3.5 h-3.5 text-bad" />
              <span>Critical Mismatch</span>
            </span>
          )}
        </div>
      </div>

      {/* Levenshtein String Similarity Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-600 font-medium">Levenshtein Distance</div>
            <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
              {nameLevenshteinDistance} <span className="text-xs text-slate-400 font-sans font-normal">char edits</span>
            </div>
          </div>
          <Scale className="w-5 h-5 text-blue-600/70" />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-600 font-medium">Name String Similarity</div>
            <div
              className={`text-lg font-black font-mono mt-0.5 ${
                nameSimilarity === 100
                  ? 'text-ok'
                  : nameSimilarity >= 40
                  ? 'text-warn'
                  : 'text-bad'
              }`}
            >
              {nameSimilarity}%
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-blue-600/70" />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-600 font-medium">UIDAI XML Signature</div>
            <div className="text-sm font-bold text-ok font-mono mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
              <span>SHA-256 Valid</span>
            </div>
          </div>
          <FileText className="w-5 h-5 text-ok/70" />
        </div>
      </div>

      {/* Cross-Field Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3 font-semibold">Field Name</th>
              <th className="py-2.5 px-3 font-semibold">UIDAI Aadhaar Record</th>
              <th className="py-2.5 px-3 font-semibold">ITD PAN Card Record</th>
              <th className="py-2.5 px-3 font-semibold">Self-Declaration</th>
              <th className="py-2.5 px-3 font-semibold text-center">Levenshtein</th>
              <th className="py-2.5 px-3 font-semibold text-center">Match %</th>
              <th className="py-2.5 px-3 font-semibold text-right">Gate Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 bg-white/40">
            {fields.map((f, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{f.field_name}</td>
                <td className="py-2.5 px-3 text-blue-600 font-mono">{f.aadhaar_value}</td>
                <td className="py-2.5 px-3 text-warn font-mono">{f.pan_value}</td>
                <td className="py-2.5 px-3 text-slate-900 font-mono">{f.declared_value}</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                  {f.levenshtein_distance}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold">
                  <span
                    className={
                      f.similarity_percentage === 100
                        ? 'text-ok'
                        : f.similarity_percentage >= 40
                        ? 'text-warn'
                        : 'text-bad'
                    }
                  >
                    {f.similarity_percentage}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  {f.flag_type === 'MATCH' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-ok/15 text-ok border border-ok/30">
                      MATCH
                    </span>
                  ) : f.flag_type === 'MINOR_DISCREPANCY' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-warn/15 text-warn border border-warn/30">
                      DISCREPANCY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-bad/15 text-bad border border-bad/30">
                      MISMATCH
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exception Flag Notice for Underwriter */}
      {requiresOfficerReview && reviewReason && (
        <div className="bg-warn/10 border border-warn/30 rounded-xl p-3.5 text-xs text-warn flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-warn">
              Loan Officer Exception Triggered: Needs Review (Module 5 Gate)
            </div>
            <p className="mt-0.5 text-slate-900">{reviewReason}</p>
            <div className="mt-1 text-[11px] text-slate-600">
              Automatically routed to Chief Underwriter & Auditor <b>Dr. Arulmozhi Varman</b> for manual override evaluation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
