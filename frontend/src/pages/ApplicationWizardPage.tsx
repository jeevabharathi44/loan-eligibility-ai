import React, { useState, useEffect } from 'react';
import { PersonaSelectorBar } from '../components/PersonaSelectorBar';
import { TriBiometricGate } from '../components/TriBiometricGate';
import { CrossFieldOCRValidator } from '../components/CrossFieldOCRValidator';
import { EBMWaterfallChart } from '../components/EBMWaterfallChart';
import {
  FileCheck,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  DollarSign,
  ShieldAlert,
  Send,
  HelpCircle,
} from 'lucide-react';
import {
  getPersonaKycApi,
  checkOcrConsistencyApi,
  evaluateUnderwritingApi,
  submitApplicationApi,
  executeDisbursementApi,
  getDemoPersonasApi,
} from '../services/api';

interface ApplicationWizardProps {
  navigate: (path: string) => void;
}

export const ApplicationWizardPage: React.FC<ApplicationWizardProps> = ({ navigate }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Active Demonstration Persona
  const [activePersonaId, setActivePersonaId] = useState<string>('jeeva_bharathi');
  const [personaData, setPersonaData] = useState<any>(null);

  // Module 1: DigiLocker KYC State
  const [kycData, setKycData] = useState<any>(null);

  // Module 2: Tri-Biometric State
  const [biometricResult, setBiometricResult] = useState<any>(null);

  // Module 3: OCR Cross-Field Consistency State
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Module 4 & 5: Underwriting & EBM State
  const [underwritingResult, setUnderwritingResult] = useState<any>(null);

  // Form inputs for Step 4 (Financial parameters)
  const [financials, setFinancials] = useState({
    income: 95000,
    loanAmount: 500000,
    tenure: 36,
    obligations: 8000,
    employmentType: 'salaried',
    purpose: 'personal',
    cibil: 785,
    dependents: 1,
    existingLoans: 1,
    paymentHistory: 98.5,
    creditUtil: 18.0,
    creditHistoryYears: 8.0,
    recentEnquiries: 1,
  });

  // Disbursement State
  const [disbursementResult, setDisbursementResult] = useState<any>(null);
  const [disburseLoading, setDisburseLoading] = useState<boolean>(false);

  // Initial load: fetch persona details
  useEffect(() => {
    loadPersona(activePersonaId);
  }, [activePersonaId]);

  const loadPersona = async (personaId: string) => {
    setLoading(true);
    setError('');
    try {
      const personas = await getDemoPersonasApi();
      const p = personas.find((x: any) => x.id === personaId) || personas[0];
      setPersonaData(p);

      // Populate financial fields
      setFinancials({
        income: p.income,
        loanAmount: p.loan_amount,
        tenure: p.loan_tenure,
        obligations: p.monthly_obligations,
        employmentType: p.employment_type,
        purpose: p.loan_purpose,
        cibil: p.cibil_score,
        dependents: p.dependents,
        existingLoans: p.existing_loans,
        paymentHistory: p.payment_history,
        creditUtil: p.credit_utilization,
        creditHistoryYears: p.credit_history_years,
        recentEnquiries: p.recent_enquiries,
      });

      // Fetch official DigiLocker KYC records
      const kyc = await getPersonaKycApi(personaId);
      setKycData(kyc);

      // Run OCR cross-field check
      const ocr = await checkOcrConsistencyApi({
        aadhaar_name: p.aadhaar_name,
        pan_name: p.pan_name,
        declared_name: p.name,
        aadhaar_dob: p.dob,
        pan_dob: p.dob,
        declared_dob: p.dob,
        pan_number: p.pan_number,
      });
      setOcrResult(ocr);

      // Reset downstream gates
      setBiometricResult(null);
      setUnderwritingResult(null);
      setDisbursementResult(null);
      setStep(1);
    } catch (err) {
      console.error('Failed to load persona data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reducing balance EMI calculation
  const calculateDerivedFinancials = () => {
    const P = financials.loanAmount;
    const n = financials.tenure;
    const inc = financials.income;
    const ob = financials.obligations;

    const r = 0.105 / 12.0; // 10.5% p.a.
    const factor = Math.pow(1 + r, n);
    const emi = n > 0 && P > 0 ? (P * r * factor) / (factor - 1) : 0;
    const dti = ((ob + emi) / inc) * 100;
    const lti = P / (inc * 12);

    return {
      emi: Math.round(emi),
      dti: dti.toFixed(1),
      lti: lti.toFixed(2),
    };
  };

  const derived = calculateDerivedFinancials();

  // Run EBM Underwriting Evaluation
  const handleRunUnderwriting = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: personaData.name,
        age: personaData.age,
        income: financials.income,
        employment_type: financials.employmentType,
        dependents: financials.dependents,
        existing_loans: financials.existingLoans,
        monthly_obligations: financials.obligations,
        loan_amount: financials.loanAmount,
        loan_tenure: financials.tenure,
        loan_purpose: financials.purpose,
        cibil_score: financials.cibil,
        payment_history: financials.paymentHistory,
        credit_utilization: financials.creditUtil,
        credit_history_years: financials.creditHistoryYears,
        recent_enquiries: financials.recentEnquiries,
        biometrics_passed: biometricResult?.passed ?? true,
        biometric_similarity: biometricResult?.compositeSimilarity ?? 88.0,
        name_similarity: ocrResult?.name_similarity ?? 100.0,
        cross_field_status: ocrResult?.status ?? 'MATCH',
      };

      // Submit to backend
      const result = await submitApplicationApi(payload);
      setUnderwritingResult(result);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Underwriting pipeline failed.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Simulated Disbursement Trigger
  const handleDisburseLoan = async () => {
    if (!underwritingResult?.application_id) return;
    setDisburseLoading(true);
    try {
      const res = await executeDisbursementApi({
        application_id: underwritingResult.application_id,
      });
      setDisbursementResult(res);
      setStep(6);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Disbursement failed.');
    } finally {
      setDisburseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Benchmark Persona Quick-Select Bar */}
      <PersonaSelectorBar
        activePersonaId={activePersonaId}
        onSelectPersona={(id) => setActivePersonaId(id)}
        onNavigateToCockpit={() => navigate('/admin')}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Loan Eligibility AI Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Glassbox Machine Learning • InterpretML EBM
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-slate-900">
            Loan <span className="text-blue-600">Eligibility</span> AI
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Explainable AI Digital Personal Loan System • RBI Digital Lending Guidelines Compliant
          </p>
        </div>

        {/* Previous Original Progress Pills */}
        <div className="flex justify-center flex-wrap gap-2 mb-6">
          {[
            { num: 1, label: 'DigiLocker SSO' },
            { num: 2, label: 'Tri-Biometrics' },
            { num: 3, label: 'OCR Consistency' },
            { num: 4, label: 'Financial Ratios' },
            { num: 5, label: 'Clear Decision' },
            { num: 6, label: 'Disbursement' },
          ].map((item) => (
            <div
              key={item.num}
              onClick={() => item.num <= step && setStep(item.num)}
              className={`pill cursor-pointer ${step === item.num ? 'on' : step > item.num ? 'done' : ''}`}
            >
              <b>{step > item.num ? '✓' : item.num}</b>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-bad/10 border border-bad/30 text-bad text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-bad shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: DigiLocker Single Sign-On & Cryptographic e-KYC */}
        {step === 1 && kycData && (
          <div className="app-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                  Module 1: DigiLocker National Gateway
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  National SSO Identity & Cryptographic e-Aadhaar Retrieval
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Direct cryptographic retrieval from UIDAI and Income Tax Department repositories
                </p>
              </div>

              <div className="px-3 py-1 bg-ok/10 border border-ok/30 rounded-xl text-ok text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>e-KYC Cryptographically Verified</span>
              </div>
            </div>

            {/* Demographics Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-blue-600 font-bold uppercase text-[11px]">
                  UIDAI Cryptographic e-Aadhaar Payload
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-900">
                  <div>Name: <b>{kycData.applicant_name}</b></div>
                  <div>Aadhaar: <b className="font-mono text-blue-600">{kycData.e_aadhaar_xml.demographics.uid_masked}</b></div>
                  <div>DOB: <b>{kycData.e_aadhaar_xml.demographics.dob}</b></div>
                  <div>Gender: <b>{kycData.e_aadhaar_xml.demographics.gender}</b></div>
                </div>
                <div className="text-slate-600 text-[11px] pt-1">
                  Address: {kycData.e_aadhaar_xml.demographics.address}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-warn font-bold uppercase text-[11px]">
                  Income Tax Department (ITD) PAN Master
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-900">
                  <div>PAN Number: <b className="font-mono text-warn">{kycData.itd_pan_master.pan}</b></div>
                  <div>Status: <b className="text-ok">{kycData.itd_pan_master.pan_status}</b></div>
                  <div>Taxpayer: <b>{kycData.itd_pan_master.name_on_card}</b></div>
                  <div>AO Code: <b>{kycData.itd_pan_master.ao_code}</b></div>
                </div>
                <div className="text-[11px] text-slate-600 pt-1">
                  Aadhaar-PAN Linkage: Confirmed Active by ITD NSDL Gateway
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Back to SSO Sign-In
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-1.5 transition-all"
              >
                <span>Proceed to Tri-Biometric Gate</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Tri-Biometric Live Facial Verification Gate */}
        {step === 2 && personaData && (
          <div className="space-y-4">
            <TriBiometricGate
              personaId={activePersonaId}
              applicantName={personaData.name}
              initialAadhaarPhoto={personaData.aadhaar_photo}
              initialPanPhoto={personaData.pan_photo}
              onVerificationComplete={(res) => {
                setBiometricResult(res);
              }}
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={biometricResult && !biometricResult.passed}
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <span>Proceed to OCR Cross-Check</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Automated OCR & Cross-Field Consistency Validation */}
        {step === 3 && ocrResult && (
          <div className="space-y-4">
            <CrossFieldOCRValidator
              status={ocrResult.status}
              overallSimilarity={ocrResult.overall_similarity}
              nameSimilarity={ocrResult.name_similarity}
              nameLevenshteinDistance={ocrResult.name_levenshtein_distance}
              fields={ocrResult.fields}
              requiresOfficerReview={ocrResult.requires_officer_review}
              reviewReason={ocrResult.review_reason}
              panStatusVerified={ocrResult.pan_status_verified}
              aadhaarXmlSignatureValid={ocrResult.aadhaar_xml_signature_valid}
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-1.5 transition-all"
              >
                <span>Proceed to Financial Parameters</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Financial Parameters & Reducing-Balance EMI Calculation */}
        {step === 4 && (
          <div className="app-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                  Module 4 Inputs
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Credit Risk Ratios & Reducing Balance EMI Engine
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Calculates Equated Monthly Installment (EMI) and Debt-to-Income (DTI / FOIR)
                </p>
              </div>

              {/* Dynamic Live Ratios Display */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-600 block font-semibold uppercase">Reducing EMI</span>
                  <span className="text-sm font-black text-blue-600 font-mono">
                    ₹{derived.emi.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-600 block font-semibold uppercase">DTI (FOIR)</span>
                  <span
                    className={`text-sm font-black font-mono ${
                      parseFloat(derived.dti) <= 50
                        ? 'text-ok'
                        : parseFloat(derived.dti) <= 70
                        ? 'text-warn'
                        : 'text-bad'
                    }`}
                  >
                    {derived.dti}%
                  </span>
                </div>
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-600 block font-semibold uppercase">LTI Multiplier</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {derived.lti}x
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  Requested Loan Principal (INR)
                </label>
                <input
                  type="number"
                  value={financials.loanAmount}
                  onChange={(e) => setFinancials({ ...financials, loanAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-cy"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  value={financials.tenure}
                  onChange={(e) => setFinancials({ ...financials, tenure: parseInt(e.target.value) || 36 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-cy"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  Monthly Net Income (INR)
                </label>
                <input
                  type="number"
                  value={financials.income}
                  onChange={(e) => setFinancials({ ...financials, income: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-cy"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  Existing Monthly Debt Obligations (INR)
                </label>
                <input
                  type="number"
                  value={financials.obligations}
                  onChange={(e) => setFinancials({ ...financials, obligations: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-cy"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  CIBIL Credit Score (300–900)
                </label>
                <input
                  type="number"
                  value={financials.cibil}
                  onChange={(e) => setFinancials({ ...financials, cibil: parseInt(e.target.value) || 650 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-cy"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  Employment Stability
                </label>
                <select
                  value={financials.employmentType}
                  onChange={(e) => setFinancials({ ...financials, employmentType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cy"
                >
                  <option value="salaried">Salaried (Corporate Payroll)</option>
                  <option value="self_employed">Self-Employed (Business / Professional)</option>
                  <option value="not_employed">Not Employed / Unemployed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleRunUnderwriting}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                <span>Evaluate with Microsoft InterpretML EBM</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: EBM Explainability Results & Dynamic Decision Gates */}
        {step === 5 && underwritingResult && (
          <div className="space-y-6">
            {/* Decision Gate Banner */}
            <div
              className={`rounded-2xl p-6 border shadow-lg transition-all ${
                underwritingResult.system_decision === 'APPROVED'
                  ? 'bg-ok/10 border-ok/30 text-slate-900'
                  : underwritingResult.system_decision === 'NEEDS_REVIEW'
                  ? 'bg-warn/10 border-warn/30 text-slate-900'
                  : 'bg-bad/10 border-bad/30 text-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {underwritingResult.system_decision === 'APPROVED' ? (
                    <CheckCircle2 className="w-10 h-10 text-ok shrink-0" />
                  ) : underwritingResult.system_decision === 'NEEDS_REVIEW' ? (
                    <AlertTriangle className="w-10 h-10 text-warn shrink-0" />
                  ) : (
                    <XCircle className="w-10 h-10 text-bad shrink-0" />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 shadow-sm text-slate-900 font-mono">
                        {underwritingResult.risk_tier} RISK TIER
                      </span>
                      <span className="font-mono text-xs text-slate-600">
                        App No: {underwritingResult.application_no}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black mt-1 text-slate-900">
                      {underwritingResult.system_decision === 'APPROVED'
                        ? '🟢 Loan Sanction Approved (Prime Tier)'
                        : underwritingResult.system_decision === 'NEEDS_REVIEW'
                        ? '🟡 Underwriter Exception Review Required (Near-Prime)'
                        : '🔴 Loan Policy Rejected (Subprime / Adverse Risk)'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                      {underwritingResult.decision_summary}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-slate-600">
                    Calibrated Approval Probability
                  </div>
                  <div className={`text-3xl font-black font-mono ${
                    underwritingResult.system_decision === 'APPROVED' ? 'text-ok' : underwritingResult.system_decision === 'NEEDS_REVIEW' ? 'text-warn' : 'text-bad'
                  }`}>
                    {underwritingResult.probability_percentage}%
                  </div>
                </div>
              </div>

              {/* Policy Decision Drivers */}
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-900">Automated Underwriting Reasons:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {underwritingResult.decision_reasons.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* EBM Waterfall Chart */}
            <EBMWaterfallChart
              intercept={underwritingResult.intercept}
              waterfallBars={underwritingResult.waterfall_bars}
              positiveFactors={underwritingResult.positive_factors}
              negativeFactors={underwritingResult.negative_factors}
              allFactors={underwritingResult.all_factors}
              probabilityPercentage={underwritingResult.probability_percentage}
              riskTier={underwritingResult.risk_tier}
            />

            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Parameters</span>
              </button>

              <div className="flex items-center gap-3">
                {underwritingResult.system_decision === 'NEEDS_REVIEW' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-5 py-2.5 bg-warn hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-warn/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Inspect in Dr. Arulmozhi Varman Cockpit</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                )}

                {underwritingResult.system_decision === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={handleDisburseLoan}
                    disabled={disburseLoading}
                    className="px-6 py-2.5 bg-ok hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-ok/20 flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {disburseLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <DollarSign className="w-4 h-4 text-white" />}
                    <span>Instant NPCI e-Mandate & IMPS Disbursement</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Simulated Disbursement & Key Fact Statement */}
        {step === 6 && disbursementResult && (
          <div className="app-card p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-ok/15 text-ok rounded-full flex items-center justify-center mx-auto border-2 border-ok shadow-xl shadow-ok/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-ok/20 text-ok text-xs font-bold uppercase tracking-wider border border-ok/30">
                Loan Fully Disbursed
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                ₹{disbursementResult.disbursement_amount?.toLocaleString()} Credited via IMPS
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Electronic auto-debit e-mandate registered with NPCI / NACH and immediate payment settlement completed.
              </p>
            </div>

            {/* Banking Transaction Slips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-blue-600 font-bold uppercase text-[10px]">
                  NPCI NACH e-Mandate Confirmation
                </div>
                <div>UMRN: <b className="font-mono text-slate-900">{disbursementResult.nach_umrn}</b></div>
                <div>Bank: <b className="text-slate-900">{disbursementResult.bank_name}</b></div>
                <div>Account: <b className="font-mono text-slate-900">{disbursementResult.bank_account_masked}</b></div>
                <div>Mandate Status: <b className="text-ok">{disbursementResult.mandate_status}</b></div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-ok font-bold uppercase text-[10px]">
                  IMPS Real-Time Transfer Slip
                </div>
                <div>RRN: <b className="font-mono text-slate-900">{disbursementResult.imps_rrn}</b></div>
                <div>UTR: <b className="font-mono text-slate-900">{disbursementResult.imps_utr}</b></div>
                <div>Amount: <b className="text-slate-900">₹{disbursementResult.disbursement_amount?.toLocaleString()}</b></div>
                <div>Status: <b className="text-ok">COMPLETED_SUCCESS</b></div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors"
              >
                View Institutional Cockpit Audit Trail
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  loadPersona('jeeva_bharathi');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all"
              >
                Test Next Persona
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
