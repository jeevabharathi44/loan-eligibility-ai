import React, { useState } from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Layers, ShieldCheck, Info } from 'lucide-react';

interface WaterfallBar {
  name: string;
  type: 'base' | 'bonus' | 'penalty' | 'total';
  value: number;
  running_total: number;
  color: string;
}

interface EBMFactor {
  feature: string;
  feature_label: string;
  value: any;
  contribution: number;
  direction: 'positive' | 'negative';
  explanation: string;
}

interface EBMWaterfallChartProps {
  intercept: number;
  waterfallBars: WaterfallBar[];
  positiveFactors: EBMFactor[];
  negativeFactors: EBMFactor[];
  allFactors: EBMFactor[];
  probabilityPercentage: number;
  riskTier: string;
}

export const EBMWaterfallChart: React.FC<EBMWaterfallChartProps> = ({
  intercept,
  waterfallBars,
  positiveFactors,
  negativeFactors,
  allFactors,
  probabilityPercentage,
  riskTier,
}) => {
  const [activeTab, setActiveTab] = useState<'waterfall' | 'factors' | 'formula'>('waterfall');
  const [selectedFactor, setSelectedFactor] = useState<EBMFactor | null>(null);

  // Find max absolute running total to scale bars
  const maxVal = Math.max(
    ...waterfallBars.map((b) => Math.abs(b.running_total)),
    ...waterfallBars.map((b) => Math.abs(b.value)),
    2.5
  );

  return (
    <div className="app-card p-6 shadow-xl">
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ok" />
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              Module 4: Explainable Boosting Machine (EBM) Underwriting Engine
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Microsoft InterpretML GA²M Architecture — Mathematical Local Logit Attributions & RBI Fair Lending Explanations
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('waterfall')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'waterfall'
                ? 'bg-blue-50 text-blue-600 border border-blue-300 shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Logit Waterfall Chart
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factors')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'factors'
                ? 'bg-blue-50 text-blue-600 border border-blue-300 shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Factor Rankings ({allFactors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'formula'
                ? 'bg-blue-50 text-blue-600 border border-blue-300 shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GA²M Math & Formula
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Waterfall Chart */}
      {activeTab === 'waterfall' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-dim" /> Base Intercept ({intercept.toFixed(3)})
              </span>
              <span className="flex items-center gap-1.5 text-ok font-medium">
                <span className="w-3 h-3 rounded-sm bg-ok" /> Positive Bonus (+ Logits)
              </span>
              <span className="flex items-center gap-1.5 text-bad font-medium">
                <span className="w-3 h-3 rounded-sm bg-bad" /> Risk Penalty (- Logits)
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                <span className="w-3 h-3 rounded-sm bg-cy" /> Net Logit Score
              </span>
            </div>

            <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-mono">
              Calibrated Approval: <b className="text-blue-600">{probabilityPercentage}%</b>
            </div>
          </div>

          {/* Waterfall Bar Visualizer */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {waterfallBars.map((bar, idx) => {
              const isPositive = bar.value >= 0;

              return (
                <div key={idx} className="flex items-center text-xs group hover:bg-slate-50 p-1 rounded-lg transition-colors">
                  <div className="w-40 font-medium text-slate-900 truncate pr-2" title={bar.name}>
                    {bar.name}
                  </div>

                  {/* Horizontal Bar Track with Center Zero Line */}
                  <div className="flex-1 relative h-6 bg-white rounded-md overflow-hidden flex items-center border border-slate-200">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-line z-10" />

                    {/* Bar Fill */}
                    {bar.type === 'base' ? (
                      <div
                        className="h-full bg-dim rounded-sm flex items-center px-2 text-[10px] font-mono text-slate-900"
                        style={{
                          width: `${Math.min(50, (Math.abs(bar.value) / maxVal) * 50)}%`,
                          marginLeft: isPositive ? '50%' : `${50 - (Math.abs(bar.value) / maxVal) * 50}%`,
                        }}
                      >
                        {bar.value > 0 ? `+${bar.value.toFixed(3)}` : bar.value.toFixed(3)}
                      </div>
                    ) : bar.type === 'total' ? (
                      <div
                        className="h-full bg-cy text-white rounded-sm flex items-center px-2 text-[10px] font-mono font-bold"
                        style={{
                          width: `${Math.min(50, (Math.abs(bar.value) / maxVal) * 50)}%`,
                          marginLeft: isPositive ? '50%' : `${50 - (Math.abs(bar.value) / maxVal) * 50}%`,
                        }}
                      >
                        Net: {bar.value > 0 ? `+${bar.value.toFixed(3)}` : bar.value.toFixed(3)}
                      </div>
                    ) : (
                      <div
                        className={`h-full rounded-sm flex items-center px-2 text-[10px] font-mono font-bold transition-all ${
                          isPositive
                            ? 'bg-ok text-white justify-start'
                            : 'bg-bad text-white justify-end'
                        }`}
                        style={{
                          width: `${Math.min(50, (Math.abs(bar.value) / maxVal) * 50)}%`,
                          marginLeft: isPositive ? '50%' : `${50 - (Math.abs(bar.value) / maxVal) * 50}%`,
                        }}
                      >
                        {isPositive ? `+${bar.value.toFixed(3)}` : bar.value.toFixed(3)}
                      </div>
                    )}
                  </div>

                  {/* Running Total Indicator */}
                  <div className="w-24 text-right font-mono text-[11px] font-bold text-slate-600 pl-2">
                    Σ {bar.running_total.toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Structured Factor Rankings */}
      {activeTab === 'factors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Factors */}
          <div className="bg-slate-50 p-4 rounded-xl border border-ok/30">
            <div className="flex items-center gap-2 mb-3 text-ok font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Top Approval Bonuses (+ Logits)</span>
            </div>
            <div className="space-y-2.5">
              {positiveFactors.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedFactor(f)}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-ok/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">{f.feature_label}</span>
                    <span className="font-mono font-bold text-ok">+{f.contribution.toFixed(3)} logits</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{f.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Factors */}
          <div className="bg-slate-50 p-4 rounded-xl border border-bad/30">
            <div className="flex items-center gap-2 mb-3 text-bad font-bold text-xs uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Top Risk Penalties (- Logits)</span>
            </div>
            <div className="space-y-2.5">
              {negativeFactors.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedFactor(f)}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-bad/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">{f.feature_label}</span>
                    <span className="font-mono font-bold text-bad">{f.contribution.toFixed(3)} logits</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{f.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GA²M Math & Formula */}
      {activeTab === 'formula' && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Generalized Additive Model with Pairwise Interactions (GA²M)</span>
          </div>

          <div className="p-4 bg-white rounded-lg font-mono text-[11px] text-slate-900 border border-slate-200 leading-relaxed overflow-x-auto">
            <div className="text-blue-600 font-bold mb-1">// Mathematical Formulation of EBM:</div>
            <div>logit(P(Approved)) = β₀ + Σ fᵢ(xᵢ) + ΣΣ fᵢⱼ(xᵢ, xⱼ)</div>
            <div className="mt-2 text-slate-600">Where:</div>
            <div>• β₀ = Base Intercept ({intercept.toFixed(4)})</div>
            <div>• fᵢ(xᵢ) = Univariate spline curves for single attributes (CIBIL, DTI, Income, etc.)</div>
            <div>• fᵢⱼ(xᵢ, xⱼ) = Bivariate interaction terms for coupled risk (e.g. DTI × Income)</div>
            <div>• P(Approved) = 1 / (1 + e^(-logit))</div>
          </div>

          <div className="text-slate-600 text-xs leading-relaxed">
            Unlike deep neural networks or random forests, the EBM architecture evaluates exact shape functions with zero approximation error. 
            Every single logit credit or penalty has a direct causal derivation, fulfilling the <b>Reserve Bank of India (RBI) Digital Lending Guidelines</b> requirement for algorithmic transparency and non-discriminatory credit access.
          </div>
        </div>
      )}
    </div>
  );
};
