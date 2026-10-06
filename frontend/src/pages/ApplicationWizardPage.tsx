import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createApplicationApi, verifyCreditApi, runPredictionApi } from '../services/api';
import { CibilGauge } from '../components/CibilGauge';
import { FactorBar } from '../components/FactorBar';
import { RiskBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

interface ApplicationWizardProps {
  navigate: (path: string) => void;
}

export const ApplicationWizardPage: React.FC<ApplicationWizardProps> = ({ navigate }) => {
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Step 1: Profile
  const [profile, setProfile] = useState({
    name: user?.name || 'Arjun Sharma',
    age: '30',
    gender: 'Male',
    maritalStatus: 'Single / Unmarried',
    income: '90000',
    job: 'salaried',
    dep: '1',
  });

  // Step 2: Loan Details
  const [loan, setLoan] = useState({
    amountLakhs: '8', // Lakhs
    tenure: '36', // Months
    purpose: 'home',
    existingLoans: '1',
    monthlyObligations: '5000',
  });

  // Step 3: Credit Profile
  const [credit, setCredit] = useState({
    score: '780',
    pay: '98',
    util: '20',
    yrs: '8',
    enq: '1',
    providerMode: 'mock' as 'mock' | 'verified',
    consent: true,
  });

  // Step 4: Result state
  const [savedApplicationId, setSavedApplicationId] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sample Profiles matching screenshot personas
  const SAMPLES = [
    {
      label: '👨‍💼 Arjun (Prime)',
      p: { name: 'Arjun Sharma', age: '30', gender: 'Male', maritalStatus: 'Single / Unmarried', income: '90000', job: 'salaried', dep: '1' },
      l: { amountLakhs: '8', tenure: '36', purpose: 'home', existingLoans: '1', monthlyObligations: '5000' },
      c: { score: '780', pay: '98', util: '20', yrs: '8', enq: '1', providerMode: 'mock', consent: true },
    },
    {
      label: '👩‍🍳 Meena (Review)',
      p: { name: 'Meena Patel', age: '42', gender: 'Female', maritalStatus: 'Married', income: '45000', job: 'self', dep: '2' },
      l: { amountLakhs: '12', tenure: '48', purpose: 'business', existingLoans: '2', monthlyObligations: '8000' },
      c: { score: '690', pay: '88', util: '55', yrs: '5', enq: '3', providerMode: 'mock', consent: true },
    },
    {
      label: '👨‍🔧 Rajan (Declined)',
      p: { name: 'Rajan Verma', age: '55', gender: 'Male', maritalStatus: 'Married', income: '25000', job: 'self', dep: '4' },
      l: { amountLakhs: '30', tenure: '60', purpose: 'personal', existingLoans: '3', monthlyObligations: '12000' },
      c: { score: '520', pay: '60', util: '90', yrs: '2', enq: '6', providerMode: 'mock', consent: true },
    },
  ];

  const loadSample = (s: typeof SAMPLES[0]) => {
    setProfile({ ...s.p });
    setLoan({ ...s.l });
    setCredit({ ...s.c, providerMode: 'mock', consent: true });
    setErrors({});
  };

  // Financial calculations
  const calculateDerived = () => {
    const P = (parseFloat(loan.amountLakhs) || 0) * 100000;
    const n = parseInt(loan.tenure) || 36;
    const inc = parseFloat(profile.income) || 10000;
    const obligations = parseFloat(loan.monthlyObligations) || 0;

    const r = 0.105 / 12; // 10.5% annual rate
    const factor = Math.pow(1 + r, n);
    const emi = n > 0 && P > 0 ? (P * r * factor) / (factor - 1) : 0;
    const dti = ((obligations + emi) / inc) * 100;
    const lti = P / (inc * 12);

    return {
      emi: Math.round(emi),
      dti: dti.toFixed(1),
      lti: lti.toFixed(1),
      principal: P,
    };
  };

  const derived = calculateDerived();

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!profile.name || profile.name.trim().length < 2) errs.name = 'Full name is required';
    const age = parseInt(profile.age);
    if (isNaN(age) || age < 18 || age > 75) errs.age = 'Age must be between 18 and 75';
    const inc = parseFloat(profile.income);
    if (isNaN(inc) || inc < 5000) errs.income = 'Minimum monthly income is ₹5,000';
    const dep = parseInt(profile.dep);
    if (isNaN(dep) || dep < 0 || dep > 10) errs.dep = 'Dependents must be 0-10';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    const amt = parseFloat(loan.amountLakhs);
    if (isNaN(amt) || amt < 0.5 || amt > 500) errs.amount = 'Loan amount must be 0.5 - 500 Lakhs';
    const tenure = parseInt(loan.tenure);
    if (isNaN(tenure) || tenure < 6 || tenure > 360) errs.tenure = 'Tenure must be 6 - 360 months';
    const exLoans = parseInt(loan.existingLoans);
    if (isNaN(exLoans) || exLoans < 0 || exLoans > 10) errs.existingLoans = 'Enter 0 - 10 active loans';
    const obligations = parseFloat(loan.monthlyObligations);
    if (isNaN(obligations) || obligations < 0) errs.obligations = 'Enter valid monthly obligations';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation & Submit
  const validateAndSubmit = async () => {
    const errs: Record<string, string> = {};
    const score = parseInt(credit.score);
    if (isNaN(score) || score < 300 || score > 900) errs.score = 'Enter a valid CIBIL score (300-900)';
    const pay = parseFloat(credit.pay);
    if (isNaN(pay) || pay < 0 || pay > 100) errs.pay = 'Enter 0-100%';
    const util = parseFloat(credit.util);
    if (isNaN(util) || util < 0 || util > 100) errs.util = 'Enter 0-100%';
    const yrs = parseFloat(credit.yrs);
    if (isNaN(yrs) || yrs < 0 || yrs > 50) errs.yrs = 'Enter 0-50 years';
    const enq = parseInt(credit.enq);
    if (isNaN(enq) || enq < 0 || enq > 20) errs.enq = 'Enter 0-20 enquiries';
    if (!credit.consent) errs.consent = 'Consent is required to evaluate credit profile';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError('');

    try {
      const appPayload = {
        income: parseFloat(profile.income),
        employmentType: profile.job === 'self' ? 'self_employed' : profile.job,
        age: parseInt(profile.age),
        dependents: parseInt(profile.dep),
        loanAmount: parseFloat(loan.amountLakhs) * 100000,
        loanTenure: parseInt(loan.tenure),
        loanPurpose: loan.purpose,
        existingLoans: parseInt(loan.existingLoans),
        monthlyObligations: parseFloat(loan.monthlyObligations),
      };

      const createdApp = await createApplicationApi(appPayload);
      setSavedApplicationId(createdApp.id);

      await verifyCreditApi({
        applicationId: createdApp.id,
        cibilScore: parseInt(credit.score),
        paymentHistory: parseFloat(credit.pay),
        creditUtilization: parseFloat(credit.util),
        creditHistoryYears: parseFloat(credit.yrs),
        recentEnquiries: parseInt(credit.enq),
        consentGiven: credit.consent,
        providerMode: credit.providerMode,
      });

      const predictionData = await runPredictionApi(createdApp.id);
      setPredictionResult(predictionData);

      setStep(4);
    } catch (err: any) {
      console.error('Underwriting pipeline failed:', err);
      setError(err.response?.data?.message || err.message || 'Underwriting pipeline failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPredictionResult(null);
    setSavedApplicationId('');
    setErrors({});
    setError('');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* 1. Header Banner Card matching screenshot */}
      <div className="app-card p-6 sm:p-7 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Minimization • Zero Identity Documents Stored</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Citizen Demographic Profile
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
              Complete the 4 brief steps below to enable deterministic eligibility evaluation across explainable EBM credit models.
            </p>
          </div>

          <button
            onClick={() => {
              if (step === 1 && validateStep1()) setStep(2);
              else if (step === 2 && validateStep2()) setStep(3);
              else if (step === 3) validateAndSubmit();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm shrink-0 transition-all self-start sm:self-center disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{step === 4 ? 'Assessment Complete' : 'Check Eligibility Now →'}</span>
          </button>
        </div>
      </div>

      {/* 2. Step Progress Breadcrumb Card matching screenshot */}
      <div className="app-card p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between relative px-2 sm:px-6">
          {/* Background connecting bar */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-2 z-0" />

          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Loan Goals' },
            { num: 3, label: 'Credit & CIBIL' },
            { num: 4, label: 'Assessment' },
          ].map((item) => (
            <div
              key={item.num}
              onClick={() => {
                if (item.num < step) setStep(item.num);
              }}
              className="flex flex-col items-center relative z-10 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  step === item.num
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step > item.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-500'
                }`}
              >
                {step > item.num ? '✓' : item.num}
              </div>
              <span
                className={`text-xs mt-2 font-semibold ${
                  step === item.num ? 'text-blue-600 font-bold' : step > item.num ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Main Step Form Card matching screenshot */}
      <div className="app-card p-6 sm:p-8">
        
        {/* STEP 1: Basic Demographics */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                STEP 1 OF 4
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Basic Demographics
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fundamental age, employment stability, and cash flow parameters used to evaluate risk.
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1">Demo profiles:</span>
              {SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(s)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-xs font-semibold text-slate-700 hover:text-emerald-700 shadow-2xs transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Evaluates identification record against credit bureau repositories.
                </span>
                {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age (in complete years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Evaluates criteria for repayment longevity and career vintage.
                </span>
                {errors.age && <p className="text-rose-600 text-[11px] mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Collected for demographic compliance and affirmative scheme lending.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Marital Status
                </label>
                <select
                  value={profile.maritalStatus}
                  onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="Single / Unmarried">Single / Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enables household cash flow and co-borrower eligibility.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Employment Stability <span className="text-rose-500">*</span>
                </label>
                <select
                  value={profile.job}
                  onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="salaried">Salaried (Predictable Monthly Paycheck)</option>
                  <option value="self">Self-Employed / Business Owner</option>
                  <option value="none">Currently Not Employed</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Strictly enforced for regular income verification.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Monthly Net Take-Home Income (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Required for Fixed Obligation to Income Ratio (FOIR).
                </span>
                {errors.income && <p className="text-rose-600 text-[11px] mt-1">{errors.income}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm flex items-center gap-2 transition-all"
              >
                Next: Loan Goals →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loan Goals & Affordability */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                STEP 2 OF 4
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Loan Goals & Exposure Limits
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your requested principal and repayment tenure.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Requested Principal (₹ Lakh) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={loan.amountLakhs}
                  onChange={(e) => setLoan({ ...loan, amountLakhs: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Equivalent to ₹{(parseFloat(loan.amountLakhs) * 100000 || 0).toLocaleString('en-IN')}
                </span>
                {errors.amount && <p className="text-rose-600 text-[11px] mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tenure (Months) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={loan.tenure}
                  onChange={(e) => setLoan({ ...loan, tenure: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years - Recommended)</option>
                  <option value="48">48 Months (4 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="120">120 Months (10 Years)</option>
                  <option value="240">240 Months (20 Years)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {(parseInt(loan.tenure) / 12 || 0).toFixed(1)} years repayment schedule.
                </span>
                {errors.tenure && <p className="text-rose-600 text-[11px] mt-1">{errors.tenure}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Loan Purpose <span className="text-rose-500">*</span>
                </label>
                <select
                  value={loan.purpose}
                  onChange={(e) => setLoan({ ...loan, purpose: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="home">Home Purchase / Construction</option>
                  <option value="business">Business Expansion / Working Capital</option>
                  <option value="education">Higher Education & Tuition</option>
                  <option value="vehicle">Vehicle Acquisition</option>
                  <option value="personal">Personal / Medical Expenses</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Purpose determines risk weighting under banking guidelines.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Active Existing Loans
                </label>
                <input
                  type="number"
                  value={loan.existingLoans}
                  onChange={(e) => setLoan({ ...loan, existingLoans: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Number of active open borrowing facilities.
                </span>
                {errors.existingLoans && <p className="text-rose-600 text-[11px] mt-1">{errors.existingLoans}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Monthly Debt Obligations (₹ EMI)
                </label>
                <input
                  type="number"
                  value={loan.monthlyObligations}
                  onChange={(e) => setLoan({ ...loan, monthlyObligations: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Total EMIs currently paid toward existing facilities.
                </span>
              </div>
            </div>

            {/* Ratio preview card */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Estimated Monthly EMI & Debt Servicing
                </span>
                <span className="text-sm font-black text-blue-600">
                  ₹{derived.emi.toLocaleString('en-IN')} / mo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center my-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Debt-to-Income (DTI)</span>
                  <span className={`text-sm font-black ${parseFloat(derived.dti) > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {derived.dti}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Loan-to-Income</span>
                  <span className="text-sm font-black text-slate-800">
                    {derived.lti}x annual
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8 pt-5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm"
              >
                Next: Credit & CIBIL →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Credit & CIBIL Check */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                STEP 3 OF 4
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Credit & CIBIL Score Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Validate your credit score consistency against credit utilization and payment records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  CIBIL Score (300-900) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={credit.score}
                  onChange={(e) => setCredit({ ...credit, score: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Self-declared credit bureau score (TransUnion CIBIL).
                </span>
                {errors.score && <p className="text-rose-600 text-[11px] mt-1">{errors.score}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  On-Time Repayment History (%)
                </label>
                <input
                  type="number"
                  value={credit.pay}
                  onChange={(e) => setCredit({ ...credit, pay: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Percentage of EMI payments on time.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Credit Card Utilization (%)
                </label>
                <input
                  type="number"
                  value={credit.util}
                  onChange={(e) => setCredit({ ...credit, util: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Card balance divided by limit (ideal &lt; 30%).</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Credit Vintage (Years)
                </label>
                <input
                  type="number"
                  value={credit.yrs}
                  onChange={(e) => setCredit({ ...credit, yrs: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Years since first credit facility opened.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Recent Inquiries (Last 6 Months)
                </label>
                <input
                  type="number"
                  value={credit.enq}
                  onChange={(e) => setCredit({ ...credit, enq: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Hard inquiries by lenders.</span>
              </div>
            </div>

            {/* CIBIL Gauge */}
            <CibilGauge
              score={parseInt(credit.score) || 300}
              paymentHistory={parseFloat(credit.pay) || 0}
              creditUtilization={parseFloat(credit.util) || 0}
              creditHistoryYears={parseFloat(credit.yrs) || 0}
              recentEnquiries={parseInt(credit.enq) || 0}
            />

            {/* Provider and Consent */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Verification Gateway</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  DEMO PROVIDER
                </span>
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={credit.consent}
                  onChange={(e) => setCredit({ ...credit, consent: e.target.checked })}
                  className="mt-0.5 accent-emerald-600"
                />
                <span className="text-xs leading-relaxed">
                  I give consent for transparent credit evaluation and understand this assessment uses Explainable Machine Learning.
                </span>
              </label>
              {errors.consent && <p className="text-rose-600 text-xs mt-1">{errors.consent}</p>}
            </div>

            <div className="flex justify-between gap-3 mt-8 pt-5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={validateAndSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Evaluating Model...' : 'Calculate Eligibility Outcome →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Assessment & Results */}
        {step === 4 && predictionResult && (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                STEP 4 OF 4
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Eligibility Assessment Result
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic Explainable Boosting Machine (EBM) evaluation for <strong>{profile.name}</strong>.
              </p>
            </div>

            {/* Outcome Card */}
            <div
              className={`p-5 rounded-2xl border mb-6 ${
                predictionResult.predicted_class === 'Approved'
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : predictionResult.predicted_class === 'Needs Review'
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-rose-50/80 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider ${
                      predictionResult.predicted_class === 'Approved'
                        ? 'text-emerald-700'
                        : predictionResult.predicted_class === 'Needs Review'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    Evaluation Verdict
                  </span>
                  <div
                    className={`text-3xl font-black mt-1 ${
                      predictionResult.predicted_class === 'Approved'
                        ? 'text-emerald-700'
                        : predictionResult.predicted_class === 'Needs Review'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {predictionResult.predicted_class}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Model Probability</span>
                  <strong className="text-2xl font-black text-slate-900">
                    {predictionResult.probabilityPercentage}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Likelihood Meter */}
            <div className="meter">
              <i style={{ width: `${predictionResult.probabilityPercentage}%` }} />
            </div>

            {/* Key Drivers */}
            <div className="my-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <span>🔍</span> Key Attributes Influencing Your Score:
              </h3>
              <div className="space-y-1">
                {predictionResult.all_factors?.slice(0, 5).map((factor: any, i: number) => (
                  <FactorBar key={i} factor={factor} />
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 italic mb-6">
              {predictionResult.disclaimer ||
                'This assessment is an AI-assisted risk assessment for demonstration/research purposes and is not a guaranteed loan approval or denial.'}
            </p>

            <div className="flex justify-between gap-3 pt-5 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset & Try Another
              </button>
              {savedApplicationId && (
                <button
                  type="button"
                  onClick={() => navigate(`/applications/${savedApplicationId}`)}
                  className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  View Full Record & Audit Trail
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 4. Floating Citizen Support Button matching bottom right circle in screenshot */}
      <button
        onClick={() => alert('Loan Assistant Helpdesk: For support, verify your declared credit data or consult bank guidelines.')}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg flex items-center justify-center transition-all z-40 hover:scale-105"
        title="Citizen Support"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

    </div>
  );
};
