import React, { useState, useEffect } from 'react';
import { getApplicationsApi } from '../services/api';
import { LoanApplication } from '../types';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import { History, Search, Filter, PlusCircle, Activity, Eye, ArrowRight } from 'lucide-react';

interface ApplicationHistoryProps {
  navigate: (path: string) => void;
}

export const ApplicationHistoryPage: React.FC<ApplicationHistoryProps> = ({ navigate }) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await getApplicationsApi();
        setApplications(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch application records');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const formatINR = (val: number) => {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.loanPurpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink flex items-center gap-2">
            <History className="w-7 h-7 text-cy" />
            Application History
          </h1>
          <p className="text-xs sm:text-sm text-mute mt-1">
            Archived record of all loan submissions, CIBIL checks, and model evaluations
          </p>
        </div>

        <button
          onClick={() => navigate('/apply')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg shadow-md text-xs hover:opacity-95 transition-all self-start sm:self-auto"
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

      {/* Filter and Search Bar */}
      <div className="app-card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-mute absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-field/60 border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-cy"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-mute font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {['ALL', 'APPROVED', 'NEEDS_REVIEW', 'DECLINED', 'PENDING'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-cy text-bg'
                  : 'bg-field text-mute hover:text-ink hover:bg-line/40'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="py-16 text-center text-mute text-xs">
          <Activity className="w-8 h-8 text-cy animate-spin mx-auto mb-3" />
          Loading applications...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="app-card p-12 text-center">
          <History className="w-10 h-10 text-mute mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-ink mb-1">No matching applications</h3>
          <p className="text-xs text-mute mb-4">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-mute uppercase tracking-wider text-[10px] bg-field/30">
                  <th className="p-4 font-semibold">Application Ref</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Loan Request</th>
                  <th className="p-4 font-semibold">CIBIL</th>
                  <th className="p-4 font-semibold">Underwriting Status</th>
                  <th className="p-4 font-semibold">AI Risk Score</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filteredApps.map((app) => {
                  const pred = app.predictions && app.predictions[0];
                  return (
                    <tr key={app.id} className="hover:bg-field/40 transition-colors">
                      <td className="p-4 font-medium text-ink">
                        <div>
                          <span className="font-bold capitalize">{app.loanPurpose} Loan</span>
                          <span className="block text-[10px] font-mono text-mute mt-0.5">
                            {app.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-mute">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-ink block">{formatINR(app.loanAmount)}</span>
                        <span className="text-[10px] text-mute">{app.loanTenure} months tenure</span>
                      </td>
                      <td className="p-4">
                        {app.creditProfile ? (
                          <span className="font-bold text-cy">{app.creditProfile.cibilScore}</span>
                        ) : (
                          <span className="text-mute">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-4">
                        {pred ? (
                          <div className="flex items-center gap-1.5">
                            <RiskBadge risk={pred.riskLevel} />
                            <span className="text-[10px] font-mono text-mute">
                              {(pred.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-mute text-[10px]">Unscored</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-field border border-line text-cy hover:border-cy font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
