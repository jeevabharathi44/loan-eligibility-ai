import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogIn, AlertCircle, Smartphone } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('arjun@loanai.local');
  const [password, setPassword] = useState('User@12345');
  const [error, setError] = useState('Authentication failed. Please verify credentials.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/apply');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('arjun@loanai.local');
    setPassword('User@12345');
    setError('');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@loanai.local');
    setPassword('Admin@12345');
    setError('');
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto">
      {/* Icon Badge & Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#007074] mb-3 shadow-sm">
          <Shield className="w-6 h-6 text-white stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to Loan AI</h1>
        <p className="text-xs text-slate-400 mt-1">Access your loan portfolio and AI credit evaluations</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* ONE-CLICK DEMO CREDENTIALS Box */}
        <div className="mb-6 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            ONE-CLICK DEMO CREDENTIALS
          </span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-700 transition-all font-medium shadow-none"
            >
              Demo User (Arjun)
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-xs text-amber-600 transition-all font-medium shadow-none"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Red Alert Banner matching screenshot */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arjun@loanai.local"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* National SSO DigiLocker Shortcut */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate('/sso')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>Sign In with DigiLocker / Meri Pehchaan SSO</span>
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-emerald-600 font-semibold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
