import React, { useState, useEffect } from 'react';
import { getAdminStatsApi, getAllApplicationsApi, updateApplicationStatusApi } from '../services/api';
import { AdminStats, LoanApplication } from '../types';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  Users,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  Activity,
  Edit3,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Status edit modal state
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [newStatus, setNewStatus] = useState<string>('APPROVED');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, appsData] = await Promise.all([
        getAdminStatsApi(),
        getAllApplicationsApi(1, 50),
      ]);
      setStats(statsData);
      setApplications(appsData.applications);
    } catch (err: any) {
      setError(err.message || 'Failed to load underwriter administration console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      await updateApplicationStatusApi(selectedApp.id, newStatus, overrideReason);
      setSelectedApp(null);
      setOverrideReason('');
      await fetchAdminData();
    } catch (err: any) {
      alert('Status update failed: ' + (err.message || 'Error'));
    } finally {
      setUpdating(false);
    }
  };

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="py-20 text-center text-mute text-xs">
        <Activity className="w-8 h-8 text-warn animate-spin mx-auto mb-3" />
        Loading underwriter console & portfolio risk statistics...
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-warn" />
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            Underwriter <span className="text-warn">Admin Console</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-mute mt-1">
          System-wide credit governance, institutional risk distributions, and manual decision overrides
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-bad/10 border border-bad/30 text-bad text-xs">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="app-card p-4">
          <div className="flex items-center justify-between text-mute text-xs mb-1">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-mute" />
          </div>
          <div className="text-2xl font-black text-ink">{stats?.totalUsers || 0}</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-mute text-xs mb-1">
            <span>Total Applications</span>
            <FileCheck2 className="w-4 h-4 text-mute" />
          </div>
          <div className="text-2xl font-black text-ink">{stats?.totalApplications || 0}</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-ok text-xs mb-1">
            <span>Overall Approval Rate</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-ok">{stats?.approvalRate || 0}%</div>
        </div>

        <div className="app-card p-4">
          <div className="flex items-center justify-between text-warn text-xs mb-1">
            <span>High Risk Tier</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-bad">
            {stats?.riskBreakdown?.High || 0}
          </div>
        </div>
      </div>

      {/* Applications Management Table */}
      <div className="app-card overflow-hidden mb-8">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">All Loan Applications</h2>
          <span className="text-xs text-mute font-mono">Count: {applications.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-mute uppercase tracking-wider text-[10px] bg-field/30">
                <th className="p-3.5 font-semibold">Applicant</th>
                <th className="p-3.5 font-semibold">Exposure</th>
                <th className="p-3.5 font-semibold">CIBIL</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Risk Level</th>
                <th className="p-3.5 font-semibold text-right">Underwriting Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {applications.map((app) => {
                const pred = app.predictions && app.predictions[0];
                return (
                  <tr key={app.id} className="hover:bg-field/40 transition-colors">
                    <td className="p-3.5">
                      <strong className="text-ink block">{app.user?.name || 'Applicant'}</strong>
                      <span className="text-[10px] text-mute">{app.user?.email}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-ink">{formatINR(app.loanAmount)}</span>
                      <span className="text-[10px] text-mute block capitalize">{app.loanPurpose} • {app.loanTenure}m</span>
                    </td>
                    <td className="p-3.5 font-bold text-cy">
                      {app.creditProfile ? app.creditProfile.cibilScore : '—'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-3.5">
                      {pred ? <RiskBadge risk={pred.riskLevel} /> : <span className="text-mute">—</span>}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-field border border-line text-cy hover:border-cy font-bold transition-colors text-[11px]"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setNewStatus(app.status);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-warn/10 border border-warn/30 text-warn hover:bg-warn/20 font-bold transition-colors text-[11px]"
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Override Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card max-w-md w-full p-6 border-line">
            <h3 className="text-base font-bold text-ink mb-1 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-warn" />
              Underwriter Decision Override
            </h3>
            <p className="text-xs text-mute mb-4">
              Override status for {selectedApp.user?.name} ({formatINR(selectedApp.loanAmount)})
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
                  New Underwriting Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-field border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-cy"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                  <option value="DECLINED">DECLINED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-mute uppercase tracking-wider mb-1.5">
                  Override Justification / Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Supplementary collateral pledged or manual income verification approved."
                  className="w-full bg-field border border-line rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-cy"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl bg-field border border-line text-xs font-bold text-mute hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-warn text-bg text-xs font-bold hover:opacity-95"
                >
                  {updating ? 'Saving...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
