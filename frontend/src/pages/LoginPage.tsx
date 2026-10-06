import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogIn, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cy to-blue-600 mb-3 shadow-lg shadow-cy/25">
          <Shield className="w-6 h-6 text-bg" />
        </div>
        <h1 className="text-2xl font-black text-ink">Sign in to Loan AI</h1>
        <p className="text-xs text-mute mt-1">Access your loan portfolio and AI credit evaluations</p>
      </div>

      <div className="app-card p-6 sm:p-8">
        {/* Quick demo fills */}
        <div className="mb-6 p-3 rounded-xl bg-field/80 border border-line">
          <span className="text-[11px] font-bold text-mute uppercase tracking-wider block mb-2">
            One-Click Demo Credentials
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex-1 py-1.5 px-2 rounded-lg bg-card border border-line hover:border-cy text-xs text-ink transition-colors font-medium"
            >
              Demo User (Arjun)
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 py-1.5 px-2 rounded-lg bg-card border border-line hover:border-warn text-xs text-warn transition-colors font-medium"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-bad/10 border border-bad/30 flex items-center gap-2 text-bad text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arjun@loanai.local"
              className="w-full bg-field/60 border border-line rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-field/60 border border-line rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-mute">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-cy font-bold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
