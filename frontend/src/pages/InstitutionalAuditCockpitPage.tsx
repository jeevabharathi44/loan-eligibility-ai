import React, { useState, useEffect } from 'react';
import { EBMWaterfallChart } from '../components/EBMWaterfallChart';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Send,
  Eye,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Download,
  Award,
} from 'lucide-react';
import {
  getCockpitStatsApi,
  getApplicationsListApi,
  getApplicationDetailApi,
  submitOfficerOverrideApi,
  executeDisbursementApi,
  getKfsStatementApi,
} from '../services/api';

interface InstitutionalAuditCockpitProps {
  navigate: (path: string) => void;
}

export const InstitutionalAuditCockpitPage: React.FC<InstitutionalAuditCockpitProps> = ({ navigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected application for deep inspection
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appDetail, setAppDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Override modal state
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideAction, setOverrideAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_DOCUMENTS'>('APPROVE');
  const [overrideJustification, setOverrideJustification] = useState<string>('');
  const [overrideLoading, setOverrideLoading] = useState<boolean>(false);
  const [overrideSuccess, setOverrideSuccess] = useState<string>('');

  // Disbursement state
  const [disburseLoading, setDisburseLoading] = useState<boolean>(false);
  const [kfsData, setKfsData] = useState<any>(null);
  const [showKfsModal, setShowKfsModal] = useState<boolean>(false);

  useEffect(() => {
    loadCockpitData();
  }, [filter]);

  const loadCockpitData = async () => {
    setLoading(true);
    try {
      const [s, apps] = await Promise.all([
        getCockpitStatsApi(),
        getApplicationsListApi(filter),
      ]);
      setStats(s);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load cockpit data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Inspect application detail
  const handleInspectApplication = async (id: string) => {
    setSelectedAppId(id);
    setDetailLoading(true);
    try {
      const d = await getApplicationDetailApi(id);
      setAppDetail(d);
    } catch (err) {
      console.error('Failed to load application detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Execute manual underwriter override
  const handleExecuteOverride = async () => {
    if (!selectedAppId || !overrideJustification) return;
    setOverrideLoading(true);
    try {
      await submitOfficerOverrideApi({
        application_id: selectedAppId,
        action: overrideAction,
        justification: overrideJustification,
      });
      setOverrideSuccess(`Underwriter Override recorded with immutable digital signature!`);
      setShowOverrideModal(false);
      setOverrideJustification('');
      await handleInspectApplication(selectedAppId);
      await loadCockpitData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Override failed');
    } finally {
      setOverrideLoading(false);
    }
  };

  // Execute simulated disbursement
  const handleDisburseLoan = async () => {
    if (!selectedAppId) return;
    setDisburseLoading(true);
    try {
      const res = await executeDisbursementApi({
        application_id: selectedAppId,
      });
      setKfsData(res.kfs_data);
      setShowKfsModal(true);
      await handleInspectApplication(selectedAppId);
      await loadCockpitData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Disbursement failed');
    } finally {
      setDisburseLoading(false);
    }
  };

  // View KFS Statement
  const handleViewKfs = async (id: string) => {
    try {
      const kfs = await getKfsStatementApi(id);
      setKfsData(kfs);
      setShowKfsModal(true);
    } catch (err) {
      alert('Could not fetch KFS statement.');
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.applicant_name.toLowerCase().includes(term) ||
      a.application_no.toLowerCase().includes(term) ||
      a.system_decision.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cockpit Institutional Header */}
        <div className="app-card p-6 relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cy to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cy/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-warn/15 text-warn border border-warn/30 text-[10px] font-bold uppercase tracking-wider">
                    RE Institutional Portal
                  </span>
                  <span className="text-xs text-slate-600">RBI Regulated Entity Underwriting Desk</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Institutional Underwriting & Regulatory Audit Cockpit
                </h1>
                <p className="text-xs text-slate-600">
                  Chief Underwriting Officer & Risk Auditor: <b className="text-slate-900">Dr. Arulmozhi Varman</b> (Officer ID: <span className="font-mono text-blue-600">EMP-90421</span>)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadCockpitData}
                className="p-2.5 bg-slate-50 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors"
                title="Refresh Queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/apply')}
                className="px-4 py-2 bg-gradient-to-r from-cy to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cy/20 transition-all hover:opacity-95"
              >
                Open Applicant Flow
              </button>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-200">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-semibold text-slate-600 uppercase">Queue Total</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {stats.stats.total_applications}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-semibold text-ok uppercase">Prime Approved</div>
                <div className="text-xl font-black text-ok font-mono mt-0.5">
                  {stats.stats.approved_count}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-semibold text-warn uppercase">Needs Review</div>
                <div className="text-xl font-black text-warn font-mono mt-0.5">
                  {stats.stats.needs_review_count}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-semibold text-bad uppercase">Policy Declined</div>
                <div className="text-xl font-black text-bad font-mono mt-0.5">
                  {stats.stats.declined_count}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-semibold text-blue-600 uppercase">Disbursed (INR)</div>
                <div className="text-xl font-black text-blue-600 font-mono mt-0.5">
                  ₹{(stats.stats.total_disbursed_amount_inr / 100000).toFixed(1)}L
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-semibold text-slate-600 uppercase">Avg CIBIL / DTI</div>
                <div className="text-sm font-black text-slate-900 font-mono mt-1">
                  {stats.stats.average_cibil} / {stats.stats.average_dti_percentage}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Applications' },
              { id: 'NEEDS_REVIEW', label: 'Needs Review (Action Required)' },
              { id: 'APPROVED', label: 'Prime Approved' },
              { id: 'DECLINED', label: 'Declined' },
              { id: 'DISBURSED', label: 'Disbursed' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  filter === tab.id
                    ? 'bg-blue-50 text-blue-600 border-cy shadow'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, status..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-mute focus:outline-none focus:border-cy"
            />
          </div>
        </div>

        {/* Main Grid: Application Queue + Deep Inspection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications Queue Table (5 cols on large screens) */}
          <div className="lg:col-span-5 app-card p-4 flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Real-Time Applications Queue</span>
                <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 font-mono text-[11px] border border-slate-200">
                  {filteredApps.length}
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-xs">
                  No applications found in this queue.
                </div>
              ) : (
                filteredApps.map((a) => {
                  const isSelected = selectedAppId === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleInspectApplication(a.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-50 border-cy shadow-md shadow-cy/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900">{a.applicant_name}</span>
                        <span className="font-mono text-[11px] text-slate-600">{a.application_no}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                        <span>₹{(a.requested_amount / 100000).toFixed(1)} Lakhs • {a.tenure_months}m</span>
                        <span className="font-mono">CIBIL: <b className="text-slate-900">{a.cibil_score}</b></span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                        <span className="text-slate-600 font-mono">DTI: {a.debt_to_income_ratio}%</span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            a.final_decision === 'APPROVED' || a.final_decision === 'DISBURSED'
                              ? 'bg-ok/15 text-ok border-ok/40'
                              : a.final_decision === 'NEEDS_REVIEW'
                              ? 'bg-warn/15 text-warn border-warn/40'
                              : 'bg-bad/15 text-bad border-bad/40'
                          }`}
                        >
                          {a.final_decision}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Deep Inspection & Override Deck (7 cols on large screens) */}
          <div className="lg:col-span-7 app-card p-6 h-[700px] overflow-y-auto">
            {detailLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <span>Loading application audit bundle...</span>
              </div>
            ) : !appDetail ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <Eye className="w-10 h-10 mb-2 opacity-50 text-slate-600" />
                <span className="text-sm font-semibold text-slate-900">Select an Application from Queue</span>
                <span className="text-[11px] mt-1 max-w-sm">
                  Click any applicant card to inspect the complete EBM waterfall charts, KYC Levenshtein results, and trigger manual officer overrides.
                </span>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{appDetail.application.applicant_name}</h2>
                      <span className="font-mono text-xs text-slate-600">({appDetail.application.application_no})</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Submitted on: {new Date(appDetail.application.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOverrideModal(true)}
                      className="px-3 py-1.5 bg-warn hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5 text-white" />
                      <span>Officer Override</span>
                    </button>

                    {appDetail.application.final_decision === 'APPROVED' && !appDetail.disbursement && (
                      <button
                        type="button"
                        onClick={handleDisburseLoan}
                        disabled={disburseLoading}
                        className="px-3 py-1.5 bg-ok hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-white" />
                        <span>{disburseLoading ? 'Disbursing...' : 'Disburse via IMPS'}</span>
                      </button>
                    )}

                    {appDetail.disbursement && (
                      <button
                        type="button"
                        onClick={() => handleViewKfs(appDetail.application.id)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>View RBI KFS</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Financial Underwriting Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Net Monthly Income</span>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                      ₹{appDetail.application.monthly_income.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">Reducing EMI</span>
                    <div className="text-sm font-bold text-blue-600 font-mono mt-0.5">
                      ₹{appDetail.application.calculated_emi.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">DTI / FOIR Ratio</span>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 ${
                        appDetail.application.debt_to_income_ratio <= 50
                          ? 'text-ok'
                          : appDetail.application.debt_to_income_ratio <= 70
                          ? 'text-warn'
                          : 'text-bad'
                      }`}
                    >
                      {appDetail.application.debt_to_income_ratio}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-semibold">LTI Multiplier</span>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                      {appDetail.application.loan_to_income_ratio}x
                    </div>
                  </div>
                </div>

                {/* Decision reasons callout */}
                {appDetail.application.decision_reasons && appDetail.application.decision_reasons.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-900 block mb-1">
                      Automated Policy Gate Drivers:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                      {appDetail.application.decision_reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* EBM Waterfall Chart */}
                {appDetail.ebm_explanation && (
                  <EBMWaterfallChart
                    intercept={appDetail.ebm_explanation.intercept}
                    waterfallBars={appDetail.ebm_explanation.waterfall_bars}
                    positiveFactors={appDetail.ebm_explanation.positive_factors}
                    negativeFactors={appDetail.ebm_explanation.negative_factors}
                    allFactors={appDetail.ebm_explanation.all_factors}
                    probabilityPercentage={appDetail.application.probability_percentage}
                    riskTier={appDetail.application.risk_tier}
                  />
                )}

                {/* Immutable Audit Trail Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Immutable Regulatory Audit Trail (SHA-256 Digest)</span>
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {appDetail.audit_trail.map((log: any) => (
                      <div key={log.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-blue-600">{log.action}</span>
                          <span className="text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-900 mb-1">{log.justification}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Officer: {log.officer_name} ({log.officer_id})</span>
                          <span className="truncate max-w-[200px]" title={log.digital_signature}>
                            SIG: {log.digital_signature}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Officer Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="app-card max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-warn" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Chief Underwriter Manual Override
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900">
                <div>Officer: <b>Dr. Arulmozhi Varman</b> (EMP-90421)</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Action governed by RBI Discretionary Exception Protocol (Rule 6.2)
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1.5">Override Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'APPROVE', label: 'Approve' },
                    { id: 'REQUEST_DOCUMENTS', label: 'Needs Review' },
                    { id: 'REJECT', label: 'Reject' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setOverrideAction(act.id as any)}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        overrideAction === act.id
                          ? 'bg-warn/15 text-warn border-warn'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1.5">
                  Mandatory Underwriting Justification
                </label>
                <textarea
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  rows={4}
                  placeholder="Explain why this policy exception is being granted (e.g., reviewed audited Form 16, confirmed alternative collateral, or reconciled legal name discrepancy)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-dim focus:outline-none focus:border-cy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-semibold hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteOverride}
                  disabled={overrideLoading || overrideJustification.length < 5}
                  className="px-4 py-2 bg-warn hover:bg-warn/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md"
                >
                  {overrideLoading ? 'Signing Digest...' : 'Commit Immutable Override'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RBI Key Fact Statement (KFS) Modal */}
      {showKfsModal && kfsData && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="app-card max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-ok" />
                <h3 className="font-bold text-slate-900 text-sm">
                  RBI Key Fact Statement (KFS) & Sanction Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKfsModal(false)}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-center pb-3 border-b border-slate-200 mb-3">
                  <h4 className="font-serif font-bold text-sm text-warn">
                    {kfsData.regulatory_heading}
                  </h4>
                  <div className="text-[11px] text-slate-600">{kfsData.lender_entity}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-900 mb-3">
                  <div>Borrower: <b>{kfsData.applicant_legal_name}</b></div>
                  <div>Principal: <b>₹{kfsData.loan_principal_inr?.toLocaleString()}</b></div>
                  <div>Tenure: <b>{kfsData.tenure_months} Months</b></div>
                  <div>Annualized Rate (APR): <b className="text-ok">{kfsData.annualized_percentage_rate_apr}</b></div>
                  <div>Monthly Reducing EMI: <b className="text-blue-600">₹{kfsData.monthly_equated_installment_emi?.toLocaleString()}</b></div>
                  <div>Total Interest: <b>₹{kfsData.total_interest_payable_inr?.toLocaleString()}</b></div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
                  <div>• <b>Cooling-Off / Look-Up Period:</b> {kfsData.cooling_off_look_up_period}</div>
                  <div>• <b>Prepayment Policy:</b> {kfsData.penal_charges_policy}</div>
                  <div>• <b>Nodal Grievance Redressal Officer:</b> {kfsData.nodal_grievance_officer?.name} ({kfsData.nodal_grievance_officer?.email})</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Digitally generated under RBI Digital Lending Guidelines 2022/2023
              </span>
              <button
                type="button"
                onClick={() => setShowKfsModal(false)}
                className="px-4 py-1.5 bg-slate-50 hover:bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-xs font-semibold"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
