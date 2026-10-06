import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, ArrowRight, CheckCircle2, Sliders, Lock, BarChart2 } from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Header matching prototype */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-cy/10 border border-cy/25 text-cy text-xs font-semibold uppercase tracking-wider mb-4">
          AI-Powered Loan Eligibility
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
          Loan <span className="text-cy">Eligibility</span> AI
        </h1>
        <p className="text-mute text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Explainable credit decisions powered by glassbox machine learning and an interactive CIBIL score consistency check.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate(isAuthenticated ? '/apply' : '/login')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg shadow-lg shadow-cy/25 hover:opacity-95 transition-all text-base"
          >
            Launch Loan Assessment
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/model-metrics')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-field border border-line text-ink hover:border-cy/50 transition-all text-base"
          >
            <BarChart2 className="w-5 h-5 text-cy" />
            Inspect Model Metrics
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
        <div className="app-card p-6 border border-line/60">
          <div className="w-12 h-12 rounded-xl bg-cy/10 border border-cy/30 flex items-center justify-center text-cy mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Explainable Boosting Machine</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Unlike black-box models, Microsoft InterpretML's EBM calculates exact mathematical contributions for each financial attribute, guaranteeing 100% auditability.
          </p>
        </div>

        <div className="app-card p-6 border border-line/60">
          <div className="w-12 h-12 rounded-xl bg-ok/10 border border-ok/30 flex items-center justify-center text-ok mb-4">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">CIBIL Score Verifier</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Dynamic consistency checker evaluates self-declared scores against repayment habits, credit utilization, history vintage, and recent enquiries with provider abstractions.
          </p>
        </div>

        <div className="app-card p-6 border border-line/60">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Enterprise Underwriting</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Computes banking ratios including Debt-to-Income (DTI/FOIR), Loan-to-Income (LTI), and reducing balance EMI with full audit logging and data minimization.
          </p>
        </div>
      </div>

      {/* Step workflow overview */}
      <div className="app-card p-8 border border-line/70 my-12">
        <h2 className="text-2xl font-black text-center mb-8">
          The 4-Step Underwriting Process
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">STEP 01</span>
            <h4 className="font-bold text-base mt-1 mb-2">Applicant Profile</h4>
            <p className="text-xs text-mute leading-relaxed">
              Income, age, employment stability, dependents, and existing debt obligations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">STEP 02</span>
            <h4 className="font-bold text-base mt-1 mb-2">Loan Parameters</h4>
            <p className="text-xs text-mute leading-relaxed">
              Loan purpose, requested amount, tenure, with real-time EMI & DTI calculation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">STEP 03</span>
            <h4 className="font-bold text-base mt-1 mb-2">CIBIL & Credit</h4>
            <p className="text-xs text-mute leading-relaxed">
              Credit bureau consistency check, on-time payment record, and provider consent.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">STEP 04</span>
            <h4 className="font-bold text-base mt-1 mb-2">Explainable Result</h4>
            <p className="text-xs text-mute leading-relaxed">
              Real-time EBM prediction, risk rating, contribution bars, and plain-English factors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
