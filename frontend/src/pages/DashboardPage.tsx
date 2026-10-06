import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStatsApi } from '../services/api';
import { DashboardStats } from '../types';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import {
  PlusCircle,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStatsApi();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatINR = (val: number) => {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-mute text-sm max-w-4xl mx-auto">
        <Activity className="w-8 h-8 text-cy animate-spin mx-auto mb-3" />
        Loading your underwriting portfolio...
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Welcome header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            Welcome back, <span className="text-cy">{user?.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-mute mt-1">
            Real-time status of your credit profiles and explainable AI loan assessments
          </p>
        </div>

        <button
          onClick={() => navigate('/apply')}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Application
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-bad/10 border border-bad/30 text-bad text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="app-card p-4">
          <div className="flex items-center justify-between text-mute text-xs mb-1">
            <span>Total</span>
            <FileText className="w-4 h-4 text-mute" />
          </div>
          <div className="text-2xl font-black text-ink">{stats?.totalApplications || 0}</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-ok text-xs mb-1">
            <span>Approved</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-ok">{stats?.approvedCount || 0}</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-warn text-xs mb-1">
            <span>In Review</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-warn">{stats?.reviewCount || 0}</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-bad text-xs mb-1">
            <span>Declined</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-bad">{stats?.declinedCount || 0}</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-cy text-xs mb-1">
            <span>Avg CIBIL</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-cy">
            {stats?.averageCibil ? stats.averageCibil : '—'}
          </div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-mute text-xs mb-1">
            <span>ML Status</span>
            <Activity className="w-4 h-4 text-cy" />
          </div>
          <div className="text-xs font-bold text-ok mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
            EBM Active
          </div>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="app-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink">Recent Applications</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-cy font-bold hover:underline flex items-center gap-1"
          >
            View all history
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-line rounded-xl">
            <FileText className="w-10 h-10 text-mute mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-bold text-ink mb-1">No loan applications filed yet</h3>
            <p className="text-xs text-mute mb-4 max-w-sm mx-auto">
              Ready to check your loan eligibility? Launch the explainable AI assessment wizard to get instant risk scoring.
            </p>
            <button
              onClick={() => navigate('/apply')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-field border border-line text-cy hover:border-cy transition-colors"
            >
              Start First Application
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-mute uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Application</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Tenure</th>
                  <th className="pb-3 font-semibold">CIBIL</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Risk Rating</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {stats.recentApplications.map((app) => {
                  const latestPred = app.predictions && app.predictions[0];
                  return (
                    <tr key={app.id} className="hover:bg-field/40 transition-colors">
                      <td className="py-3 font-medium text-ink">
                        <div>
                          <span className="font-bold capitalize">{app.loanPurpose} Loan</span>
                          <span className="block text-[10px] text-mute font-mono">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-bold text-ink">
                        {formatINR(app.loanAmount)}
                      </td>
                      <td className="py-3 text-mute">{app.loanTenure} mo</td>
                      <td className="py-3 font-semibold text-cy">
                        {app.creditProfile ? app.creditProfile.cibilScore : '—'}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3">
                        {latestPred ? (
                          <RiskBadge risk={latestPred.riskLevel} />
                        ) : (
                          <span className="text-mute text-[10px]">Pending AI</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-field border border-line text-cy hover:border-cy transition-colors text-[11px] font-bold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
