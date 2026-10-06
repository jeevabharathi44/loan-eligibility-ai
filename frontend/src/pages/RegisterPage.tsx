import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserPlus, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cy to-blue-600 mb-3 shadow-lg shadow-cy/25">
          <Shield className="w-6 h-6 text-bg" />
        </div>
        <h1 className="text-2xl font-black text-ink">Create an Account</h1>
        <p className="text-xs text-mute mt-1">Get started with AI-driven loan eligibility assessments</p>
      </div>

      <div className="app-card p-6 sm:p-8">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-bad/10 border border-bad/30 flex items-center gap-2 text-bad text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              className="w-full bg-field/60 border border-line rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. applicant@example.com"
              className="w-full bg-field/60 border border-line rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-field/60 border border-line rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
              className="w-full bg-field/60 border border-line rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
            >
              <option value="USER">Standard Applicant (USER)</option>
              <option value="ADMIN">Loan Underwriter (ADMIN)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-mute">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-cy font-bold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
