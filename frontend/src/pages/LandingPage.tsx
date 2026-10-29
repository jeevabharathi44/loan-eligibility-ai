import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Sliders, BarChart2, HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans">
      {/* Humanized Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cy/10 border border-cy/25 text-cy text-xs font-semibold uppercase tracking-wider mb-4">
          <HeartHandshake className="w-3.5 h-3.5 text-cy" />
          Fair & Human-Centered Lending Intelligence
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-tight text-ink">
          Clear, Transparent Loan Decisions <br />
          <span className="text-cy">You Can Actually Understand</span>
        </h1>
        <p className="text-mute text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Tired of mysterious loan rejections with zero explanation? We use Microsoft InterpretML's Glassbox AI to show you the exact math behind your score — so you're always in control of your financial future.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate(isAuthenticated ? '/apply' : '/login')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm"
          >
            Check My Eligibility in 2 Minutes
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => navigate('/model-metrics')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-field border border-line text-ink hover:bg-field/70 shadow-sm transition-all text-sm"
          >
            <BarChart2 className="w-4 h-4 text-cy" />
            Inspect Glassbox Metrics
          </button>
        </div>
      </div>

      {/* 3 Pillars of Humanized Lending */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
        <div className="app-card p-6">
          <div className="w-12 h-12 rounded-xl bg-cy/15 border border-cy/30 flex items-center justify-center text-cy mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Zero Mystery Algorithms</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Unlike cold black-box models, our Explainable Boosting Machine calculates exact contribution scores for each financial habit. You'll always know the "why".
          </p>
        </div>

        <div className="app-card p-6">
          <div className="w-12 h-12 rounded-xl bg-ok/15 border border-ok/30 flex items-center justify-center text-ok mb-4">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Credit Habit Verifier</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            Checks your self-declared CIBIL score against your true repayment habits and credit card utilization, providing friendly consistency feedback.
          </p>
        </div>

        <div className="app-card p-6">
          <div className="w-12 h-12 rounded-xl bg-warn/15 border border-warn/30 flex items-center justify-center text-warn mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-ink">Actionable Coaching</h3>
          <p className="text-xs sm:text-sm text-mute leading-relaxed">
            If your application needs review or is declined, we don't leave you stranded. We provide a personalized roadmap with concrete steps to build your score.
          </p>
        </div>
      </div>

      {/* Humanized Process Walkthrough */}
      <div className="app-card p-8 my-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 text-ink">
            A Respectful, 4-Step Journey
          </h2>
          <p className="text-mute text-xs sm:text-sm">
            Designed to empower borrowers with total clarity and zero hidden gotchas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-field/60 rounded-xl p-4 border border-line text-center">
            <div className="w-8 h-8 rounded-full bg-cy text-white font-black flex items-center justify-center mx-auto mb-3 text-sm">
              1
            </div>
            <h4 className="font-bold text-sm mb-1 text-ink">Share Identity</h4>
            <p className="text-mute text-xs">
              Quick verification through Government of India's DigiLocker Meri Pehchaan SSO.
            </p>
          </div>

          <div className="bg-field/60 rounded-xl p-4 border border-line text-center">
            <div className="w-8 h-8 rounded-full bg-cy text-white font-black flex items-center justify-center mx-auto mb-3 text-sm">
              2
            </div>
            <h4 className="font-bold text-sm mb-1 text-ink">Tri-Biometrics</h4>
            <p className="text-mute text-xs">
              3-way cross-verification across Aadhaar, PAN card, and live camera feed with liveness check.
            </p>
          </div>

          <div className="bg-field/60 rounded-xl p-4 border border-line text-center">
            <div className="w-8 h-8 rounded-full bg-cy text-white font-black flex items-center justify-center mx-auto mb-3 text-sm">
              3
            </div>
            <h4 className="font-bold text-sm mb-1 text-ink">Glassbox Math</h4>
            <p className="text-mute text-xs">
              EBM model computes exact point penalties and bonuses for transparent review.
            </p>
          </div>

          <div className="bg-field/60 rounded-xl p-4 border border-line text-center">
            <div className="w-8 h-8 rounded-full bg-ok text-white font-black flex items-center justify-center mx-auto mb-3 text-sm">
              4
            </div>
            <h4 className="font-bold text-sm mb-1 text-ink">Instant Decision</h4>
            <p className="text-mute text-xs">
              Get an instant approval notification with digital NPCI e-mandate disbursement.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="app-card p-8 text-center bg-gradient-to-br from-card via-field to-card border border-cy/30 shadow-glow-cy">
        <h3 className="text-2xl font-black mb-2 text-ink">
          Ready to experience fair, transparent lending?
        </h3>
        <p className="text-mute text-xs sm:text-sm max-w-lg mx-auto mb-6">
          Join thousands of applicants who understand their financial worth with explainable AI.
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? '/apply' : '/login')}
          className="px-8 py-3.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm inline-flex items-center gap-2"
        >
          Begin Loan Application
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
