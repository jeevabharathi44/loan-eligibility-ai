import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Sliders, Lock, BarChart2, HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Humanized Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cy/10 border border-cy/25 text-cy text-xs font-semibold uppercase tracking-wider mb-4">
          <HeartHandshake className="w-3.5 h-3.5" />
          Fair & Human-Centered Lending Intelligence
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
          Clear, Transparent Loan Decisions <br />
          <span className="text-cy">You Can Actually Understand</span>
        </h1>
        <p className="text-mute text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Tired of mysterious loan rejections with zero explanation? We use Microsoft InterpretML's Glassbox AI to show you the exact math behind your score — so you're always in control of your financial future.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate(isAuthenticated ? '/apply' : '/login')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg shadow-lg shadow-cy/25 hover:opacity-95 transition-all text-sm"
          >
            Check My Eligibility in 2 Minutes
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/model-metrics')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-field border border-line text-ink hover:border-cy/50 transition-all text-sm"
          >
            <BarChart2 className="w-4 h-4 text-cy" />
            Inspect Glassbox Metrics
          </button>
        </div>
      </div>

      {/* 3 Pillars of Humanized Lending */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
        <div className="app-card p-6 border border-line/60">
          <div className="w-12 h-12 rounded-xl bg-cy/10 border border-cy/30 flex items-center justify-center text-cy mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Zero Mystery Algorithms</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Unlike cold black-box models, our Explainable Boosting Machine calculates exact contribution scores for each financial habit. You'll always know the "why".
          </p>
        </div>

        <div className="app-card p-6 border border-line/60">
          <div className="w-12 h-12 rounded-xl bg-ok/10 border border-ok/30 flex items-center justify-center text-ok mb-4">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Credit Habit Verifier</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Checks your self-declared CIBIL score against your true repayment habits and credit card utilization, providing friendly consistency feedback.
          </p>
        </div>

        <div className="app-card p-6 border border-line/60">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Actionable Coaching</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            If your application needs review or is declined, we don't leave you stranded. We provide a personalized roadmap with 3 concrete steps to build your score.
          </p>
        </div>
      </div>

      {/* Humanized Process Walkthrough */}
      <div className="app-card p-8 border border-line/70 my-12">
        <h2 className="text-2xl font-black text-center mb-2">
          How Your Assessment Works
        </h2>
        <p className="text-xs text-mute text-center mb-8">
          4 simple, human-guided steps with zero paperwork required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">01. ABOUT YOU</span>
            <h4 className="font-bold text-sm mt-1 mb-1.5">Personal Context</h4>
            <p className="text-xs text-mute leading-relaxed">
              Tell us about your earning stability, career vintage, and family dependents.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">02. LOAN GOALS</span>
            <h4 className="font-bold text-sm mt-1 mb-1.5">Affordability Check</h4>
            <p className="text-xs text-mute leading-relaxed">
              Explore your ideal loan amount with live monthly EMI and comfortable DTI ratios.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">03. CREDIT HEALTH</span>
            <h4 className="font-bold text-sm mt-1 mb-1.5">CIBIL Verification</h4>
            <p className="text-xs text-mute leading-relaxed">
              Verify your credit score with transparent habit consistency scoring.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-field/60 border border-line">
            <span className="text-xs font-mono font-bold text-cy">04. CLEAR DECISION</span>
            <h4 className="font-bold text-sm mt-1 mb-1.5">Transparent Results</h4>
            <p className="text-xs text-mute leading-relaxed">
              Receive your explainable assessment, positive/negative drivers, and personalized coaching tips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
