import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MeriPehchaanSSOPage } from './pages/MeriPehchaanSSOPage';
import { ApplicationWizardPage } from './pages/ApplicationWizardPage';
import { ApplicationHistoryPage } from './pages/ApplicationHistoryPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { InstitutionalAuditCockpitPage } from './pages/InstitutionalAuditCockpitPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';

const SchemesView: React.FC<{ navigate: (p: string) => void }> = ({ navigate }) => (
  <div className="py-12 px-4 max-w-5xl mx-auto">
    <div className="text-center mb-10">
      <h1 className="text-3xl font-extrabold text-slate-900">National Credit Schemes</h1>
      <p className="text-sm text-slate-500 mt-1">
        RBI DLG-2022 compliant digital loan offerings with transparent pricing
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Prime Tier
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-3">Instant Personal Loan</h3>
        <p className="text-xs text-slate-500 mt-1">Pre-approved for CIBIL &gt; 750</p>
        <div className="my-4 text-2xl font-black text-slate-900">
          ₹5,00,000 <span className="text-xs font-normal text-slate-500">at 10.5% p.a.</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 mb-6">
          <li>✓ 100% Paperless DigiLocker e-KYC</li>
          <li>✓ 2-Minute Tri-Biometric Approval</li>
          <li>✓ Instant NPCI e-Mandate Disbursal</li>
        </ul>
        <button
          onClick={() => navigate('/apply')}
          className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs transition-all shadow-md shadow-blue-500/20"
        >
          Check Eligibility
        </button>
      </div>

      <div className="bg-white border-2 border-blue-600/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Most Popular
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-3">Salaried Flexi Credit</h3>
        <p className="text-xs text-slate-500 mt-1">Optimized for monthly salary earners</p>
        <div className="my-4 text-2xl font-black text-slate-900">
          ₹10,00,000 <span className="text-xs font-normal text-slate-500">at 9.8% p.a.</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 mb-6">
          <li>✓ Flexible 12 to 60-Month Tenures</li>
          <li>✓ Zero Prepayment Foreclosure Penalty</li>
          <li>✓ Explainable AI Risk Assessment</li>
        </ul>
        <button
          onClick={() => navigate('/apply')}
          className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs transition-all shadow-md shadow-blue-500/20"
        >
          Check Eligibility
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          Credit Builder
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-3">Near-Prime Booster Loan</h3>
        <p className="text-xs text-slate-500 mt-1">For scores between 650 - 720</p>
        <div className="my-4 text-2xl font-black text-slate-900">
          ₹2,50,000 <span className="text-xs font-normal text-slate-500">at 12.0% p.a.</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 mb-6">
          <li>✓ Actionable Step-by-Step Score Coaching</li>
          <li>✓ Rate Drops on Timely Repayments</li>
          <li>✓ Fair Glassbox Underwriting Review</li>
        </ul>
        <button
          onClick={() => navigate('/apply')}
          className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs transition-all shadow-md shadow-blue-500/20"
        >
          Check Eligibility
        </button>
      </div>
    </div>
  </div>
);

const CompareView: React.FC<{ navigate: (p: string) => void }> = ({ navigate }) => (
  <div className="py-12 px-4 max-w-4xl mx-auto">
    <div className="text-center mb-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Model Architecture Comparison</h1>
      <p className="text-sm text-slate-500 mt-1">
        Why Glassbox Explainable AI (InterpretML EBM) outperforms legacy black-box lending models
      </p>
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-3 bg-white border-b border-slate-200 p-4 text-xs font-bold text-slate-700">
        <div>Evaluation Feature</div>
        <div className="text-slate-500">Traditional Bank Models</div>
        <div className="text-blue-600 font-bold">Loan Assistant (Glassbox AI)</div>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        <div className="grid grid-cols-3 p-4 items-center">
          <div className="font-semibold text-slate-900">Algorithm Type</div>
          <div className="text-slate-500">Black-Box XGBoost / Deep Neural Net</div>
          <div className="font-semibold text-emerald-600">Explainable Boosting Machine (GA²M)</div>
        </div>

        <div className="grid grid-cols-3 p-4 items-center">
          <div className="font-semibold text-slate-900">Explainability Guarantee</div>
          <div className="text-slate-500">Post-hoc SHAP heuristics (approximate)</div>
          <div className="font-semibold text-emerald-600">Exact mathematical additive contribution</div>
        </div>

        <div className="grid grid-cols-3 p-4 items-center">
          <div className="font-semibold text-slate-900">Adverse Action Notice</div>
          <div className="text-slate-500">Generic rejection notice with no details</div>
          <div className="font-semibold text-emerald-600">Ranked Top 3 risk factors & coaching roadmap</div>
        </div>

        <div className="grid grid-cols-3 p-4 items-center">
          <div className="font-semibold text-slate-900">RBI Compliance</div>
          <div className="text-slate-500">Requires manual explanation audits</div>
          <div className="font-semibold text-emerald-600">Native compliance with RBI DLG-2022/2023</div>
        </div>

        <div className="grid grid-cols-3 p-4 items-center">
          <div className="font-semibold text-slate-900">Turnaround Time</div>
          <div className="text-slate-500">3 to 7 business days</div>
          <div className="font-semibold text-emerald-600">&lt; 2 minutes end-to-end</div>
        </div>
      </div>
    </div>

    <div className="mt-8 text-center">
      <button
        onClick={() => navigate('/apply')}
        className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
      >
        Start Glassbox Assessment Now
      </button>
    </div>
  </div>
);

const getNormalizedPath = (): string => {
  if (typeof window === 'undefined') return '/';
  if (window.location.hash) {
    const h = window.location.hash.replace(/^#/, '');
    if (h) return h;
  }
  let p = window.location.pathname || '/';
  // Strip repository subpath on GitHub Pages if present
  p = p.replace(/^\/loan-eligibility-ai\/?/, '/');
  return p || '/';
};

const AppRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading, setUserDirectly } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => getNormalizedPath());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    // If on GitHub Pages or nested subpath, use hash navigation to avoid 404s
    if (
      window.location.hostname.includes('github.io') ||
      window.location.pathname.includes('/loan-eligibility-ai')
    ) {
      window.location.hash = path;
    } else {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-500 text-xs">
        <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Initializing Loan Eligibility AI session...
      </div>
    );
  }

  // Routing logic matching screenshot portal
  const renderPage = () => {
    if (currentPath === '/' || currentPath === '/apply') {
      if (!isAuthenticated) {
        return <LoginPage navigate={navigate} />;
      }
      return <ApplicationWizardPage navigate={navigate} />;
    }
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/landing') {
      return <LandingPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (currentPath === '/schemes') {
      return <SchemesView navigate={navigate} />;
    }
    if (currentPath === '/compare') {
      return <CompareView navigate={navigate} />;
    }
    if (currentPath === '/sso') {
      return (
        <MeriPehchaanSSOPage
          navigate={navigate}
          onLoginSuccess={(u) => setUserDirectly(u)}
        />
      );
    }
    if (currentPath === '/history') {
      return <ApplicationHistoryPage navigate={navigate} />;
    }
    if (currentPath === '/admin' || currentPath === '/cockpit') {
      return <InstitutionalAuditCockpitPage navigate={navigate} />;
    }
    if (currentPath === '/model-metrics') {
      return <ModelPerformancePage navigate={navigate} />;
    }
    if (currentPath.startsWith('/applications/')) {
      const appId = currentPath.replace('/applications/', '') || '';
      return <ApplicationDetailPage id={appId} navigate={navigate} />;
    }

    return <ApplicationWizardPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
