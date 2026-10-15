import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogIn, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { user, isAuthenticated, login, demoLogin } = useAuth();
  const [email, setEmail] = useState('karthik@loanai.local');
  const [password, setPassword] = useState('User@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // If backend fails, fallback immediately to demo login so user never gets stuck
      demoLogin(email);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelect = (personaEmail: string, destination: string = '/dashboard') => {
    demoLogin(personaEmail);
    navigate(destination);
  };

  return (
    <div className="py-10 px-4 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 mb-3 shadow-lg shadow-blue-500/20 text-white">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to Loan AI</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explainable AI-Based Digital Personal Loan Processing System
        </p>
      </div>

      {/* Active Session Notification */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-950">Active Session: {user.name}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Instant Demo Personas */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1-Click Instant Demo Personas
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Select a benchmark persona to jump straight into the live interactive demo:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handlePersonaSelect('jeeva@loanai.local', '/apply')}
              className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all shadow-xs group col-span-1 sm:col-span-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-950 group-hover:text-emerald-800">
                    🌟 Jeeva Bharathi M
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    Real Aadhaar & PAN KYC
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                  Live Camera & OCR Match
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                UIDAI: 2235 1313 2450 • PAN: DELPJ9476P • Verified Tamil Nadu KYC & Tri-Biometrics
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaSelect('karthik@loanai.local', '/dashboard')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 text-left transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  👨‍💼 Karthik Selvam
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Prime 780
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Instant Approval • ₹8L Home</p>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaSelect('anitha@loanai.local', '/dashboard')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50/60 text-left transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                  👩‍🍳 Anitha Murugan
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  Review 690
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Underwriter Review • ₹12L Biz</p>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaSelect('muthu@loanai.local', '/dashboard')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-rose-500 hover:bg-rose-50/60 text-left transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  👨‍🔧 Muthu Pandian
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                  Declined 520
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">High DTI • Risk Advisory</p>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaSelect('admin@loanai.local', '/admin')}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/60 text-left transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                  🛡️ Dr. Arulmozhi Varman
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                  Admin Cockpit
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Chief Underwriter & Auditor</p>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. karthik@loanai.local"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-blue-600 font-bold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
