import React, { useState, useEffect } from 'react';
import { getApplicationByIdApi } from '../services/api';
import { LoanApplication } from '../types';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import { CibilGauge } from '../components/CibilGauge';
import { FactorBar } from '../components/FactorBar';
import {
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  Shield,
  Activity,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ApplicationDetailProps {
  id: string;
  navigate: (path: string) => void;
}

export const ApplicationDetailPage: React.FC<ApplicationDetailProps> = ({ id, navigate }) => {
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchApp = async () => {
      try {
        setLoading(true);
        const data = await getApplicationByIdApi(id);
        setApplication(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="py-20 text-center text-mute text-xs max-w-4xl mx-auto">
        <Activity className="w-8 h-8 text-cy animate-spin mx-auto mb-3" />
        Retrieving application record and explainable factors...
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="py-12 px-4 max-w-2xl mx-auto text-center">
        <div className="app-card p-8">
          <AlertCircle className="w-10 h-10 text-bad mx-auto mb-3" />
          <h2 className="text-lg font-bold text-ink mb-2">Error Loading Application</h2>
          <p className="text-xs text-mute mb-6">{error || 'Application not found or unauthorized.'}</p>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 rounded-xl bg-field border border-line text-xs font-bold text-cy"
          >
            Back to Application History
          </button>
        </div>
      </div>
    );
  }

  const latestPrediction = application.predictions && application.predictions[0];
  const creditProfile = application.creditProfile;

  // Derived financial ratios
  const P = application.loanAmount;
  const n = application.loanTenure;
  const inc = application.income;
  const obligations = application.monthlyObligations;
  const r = 0.105 / 12;
  const factor = Math.pow(1 + r, n);
  const emi = Math.round(n > 0 && P > 0 ? (P * r * factor) / (factor - 1) : 0);
  const dti = ((obligations + emi) / inc) * 100;
  const lti = P / (inc * 12);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back button and title */}
      <button
        onClick={() => navigate('/history')}
        className="inline-flex items-center gap-1.5 text-xs text-mute hover:text-cy mb-4 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to History
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-ink capitalize">
              {application.loanPurpose} Loan Application
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-xs font-mono text-mute mt-1">ID: {application.id}</p>
        </div>

        <div className="text-right text-xs text-mute flex sm:flex-col items-center sm:items-end justify-between">
          <span>Submitted on</span>
          <span className="font-bold text-ink">
            {new Date(application.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Applicant Profile */}
        <div className="app-card p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-cy uppercase tracking-wider mb-3">
            <User className="w-4 h-4" />
            Applicant Profile
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-mute">Name:</span>
              <span className="font-bold text-ink">{application.user?.name || 'Applicant'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Age:</span>
              <span className="font-bold text-ink">{application.age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Employment:</span>
              <span className="font-bold text-ink capitalize">
                {application.employmentType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Monthly Income:</span>
              <span className="font-bold text-ok">{formatINR(application.income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Dependents:</span>
              <span className="font-bold text-ink">{application.dependents}</span>
            </div>
          </div>
        </div>

        {/* Loan Exposure */}
        <div className="app-card p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-cy uppercase tracking-wider mb-3">
            <CreditCard className="w-4 h-4" />
            Loan Details
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-mute">Loan Amount:</span>
              <span className="font-bold text-ink">{formatINR(application.loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Tenure:</span>
              <span className="font-bold text-ink">{application.loanTenure} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Existing Loans:</span>
              <span className="font-bold text-ink">{application.existingLoans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Monthly Obligations:</span>
              <span className="font-bold text-ink">{formatINR(application.monthlyObligations)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Purpose:</span>
              <span className="font-bold text-ink capitalize">{application.loanPurpose}</span>
            </div>
          </div>
        </div>

        {/* Banking Ratios */}
        <div className="app-card p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-cy uppercase tracking-wider mb-3">
            <Percent className="w-4 h-4" />
            Underwriting Ratios
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-mute">Estimated EMI:</span>
              <span className="font-bold text-ink">{formatINR(emi)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">DTI (FOIR):</span>
              <span className={`font-bold ${dti > 55 ? 'text-bad' : 'text-ok'}`}>
                {dti.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Loan-to-Income:</span>
              <span className={`font-bold ${lti > 4 ? 'text-warn' : 'text-ok'}`}>
                {lti.toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Disposable Cashflow:</span>
              <span className="font-bold text-ink">
                {formatINR(Math.max(0, inc - (obligations + emi)))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Profile Verification Card */}
      {creditProfile && (
        <div className="app-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Shield className="w-4 h-4 text-cy" />
              CIBIL Credit Bureau Verification
            </h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold self-start sm:self-auto ${
                creditProfile.verificationStatus === 'VERIFIED'
                  ? 'bg-ok/10 text-ok border border-ok/25'
                  : 'bg-warn/10 text-warn border border-warn/25'
              }`}
            >
              {creditProfile.verificationStatus === 'VERIFIED'
                ? 'Verified Bureau Report'
                : 'Demo Credit Info — Not Verified'}
            </span>
          </div>

          <CibilGauge
            score={creditProfile.cibilScore}
            paymentHistory={creditProfile.paymentHistory}
            creditUtilization={creditProfile.creditUtilization}
            creditHistoryYears={creditProfile.creditHistoryYears}
            recentEnquiries={creditProfile.recentEnquiries}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-2.5 rounded-lg bg-field/60 border border-line">
              <span className="text-mute block text-[10px]">On-Time Repayment</span>
              <strong className="text-ink">{creditProfile.paymentHistory}%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-field/60 border border-line">
              <span className="text-mute block text-[10px]">Credit Utilization</span>
              <strong className="text-ink">{creditProfile.creditUtilization}%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-field/60 border border-line">
              <span className="text-mute block text-[10px]">Credit History Length</span>
              <strong className="text-ink">{creditProfile.creditHistoryYears} Years</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-field/60 border border-line">
              <span className="text-mute block text-[10px]">Recent Enquiries</span>
              <strong className="text-ink">{creditProfile.recentEnquiries} (6 mo)</strong>
            </div>
          </div>
        </div>
      )}

      {/* AI Prediction & EBM Explainability Result */}
      {latestPrediction ? (
        <div className="app-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cy" />
                AI Risk Assessment & EBM Explanations
              </h2>
              <p className="text-xs text-mute mt-0.5">
                Model: {latestPrediction.modelVersion} • Evaluated:{' '}
                {new Date(latestPrediction.createdAt).toLocaleString()}
              </p>
            </div>
            <RiskBadge risk={latestPrediction.riskLevel} />
          </div>

          <div className="my-4">
            <div
              className={`text-3xl font-black ${
                latestPrediction.predictedClass === 'Approved'
                  ? 'text-ok'
                  : latestPrediction.predictedClass === 'Needs Review'
                  ? 'text-warn'
                  : 'text-bad'
              }`}
            >
              {latestPrediction.predictedClass}
            </div>
            <p className="text-xs text-mute mt-1">
              {(latestPrediction.probability * 100).toFixed(1)}% estimated likelihood of approval
            </p>
          </div>

          <div className="meter">
            <i style={{ width: `${(latestPrediction.probability * 100).toFixed(0)}%` }} />
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-mute mb-3">
              Mathematical Factor Attribution (InterpretML EBM)
            </h3>
            <div className="space-y-1">
              {latestPrediction.factors && latestPrediction.factors.length > 0 ? (
                latestPrediction.factors.map((factor, i) => (
                  <FactorBar key={i} factor={factor} />
                ))
              ) : (
                <p className="text-xs text-mute">No individual factors logged.</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-dim mt-6 italic">
            This assessment is an AI-assisted risk assessment for demonstration/research purposes and is not a guaranteed loan approval or denial.
          </p>
        </div>
      ) : (
        <div className="app-card p-6 mb-8 text-center text-xs text-mute">
          No AI risk evaluation has been computed for this application yet.
        </div>
      )}

      {/* Audit Log Trail */}
      {application.auditLogs && application.auditLogs.length > 0 && (
        <div className="app-card p-6">
          <h2 className="text-base font-bold text-ink flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-cy" />
            Audit & Compliance Trail
          </h2>
          <div className="space-y-3">
            {application.auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 rounded-xl bg-field/40 border border-line/60 text-xs"
              >
                <div>
                  <span className="font-bold text-ink font-mono">{log.action}</span>
                  {log.metadata && (
                    <span className="block text-mute text-[11px] mt-0.5">
                      {log.metadata}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-dim whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
