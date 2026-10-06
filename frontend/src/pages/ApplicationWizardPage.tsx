import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createApplicationApi, verifyCreditApi, runPredictionApi } from '../services/api';
import { CibilGauge } from '../components/CibilGauge';
import { FactorBar } from '../components/FactorBar';
import { RiskBadge } from '../components/StatusBadge';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Eye,
  AlertTriangle,
  Lightbulb,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
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

  // Humanized Personas with relatable life stories
  const SAMPLES = [
    {
      id: 'arjun',
      icon: '👨‍💼',
      name: 'Arjun Sharma',
      tag: 'Prime Salaried (₹90k/mo)',
      story: 'Buying a family home',
      p: { name: 'Arjun Sharma', age: '30', income: '90000', job: 'salaried', dep: '1' },
      l: { amountLakhs: '8', tenure: '36', purpose: 'home', existingLoans: '1', monthlyObligations: '5000' },
      c: { score: '780', pay: '98', util: '20', yrs: '8', enq: '1', providerMode: 'mock', consent: true },
    },
    {
      id: 'meena',
      icon: '👩‍🍳',
      name: 'Meena Patel',
      tag: 'Self-Employed (₹45k/mo)',
      story: 'Expanding catering bakery',
      p: { name: 'Meena Patel', age: '42', income: '45000', job: 'self_employed', dep: '2' },
      l: { amountLakhs: '12', tenure: '48', purpose: 'business', existingLoans: '2', monthlyObligations: '8000' },
      c: { score: '690', pay: '88', util: '55', yrs: '5', enq: '3', providerMode: 'mock', consent: true },
    },
    {
      id: 'rajan',
      icon: '👨‍🔧',
      name: 'Rajan Verma',
      tag: 'High Debt Load (₹25k/mo)',
      story: 'Emergency debt relief',
      p: { name: 'Rajan Verma', age: '55', income: '25000', job: 'self_employed', dep: '4' },
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
    if (!profile.name || profile.name.trim().length < 2) errs.name = 'Please provide your full name as on government ID';
    const age = parseInt(profile.age);
    if (isNaN(age) || age < 18 || age > 75) errs.age = 'Age must be between 18 and 75';
    const inc = parseFloat(profile.income);
    if (isNaN(inc) || inc < 5000) errs.income = 'Minimum monthly income is ₹5,000';
    const dep = parseInt(profile.dep);
    if (isNaN(dep) || dep < 0 || dep > 10) errs.dep = 'Dependents must be between 0 and 10';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    const amt = parseFloat(loan.amountLakhs);
    if (isNaN(amt) || amt < 0.5 || amt > 500) errs.amount = 'Loan amount must be between 0.5 and 500 Lakhs';
    const tenure = parseInt(loan.tenure);
    if (isNaN(tenure) || tenure < 6 || tenure > 360) errs.tenure = 'Tenure must be between 6 and 360 months';
    const exLoans = parseInt(loan.existingLoans);
    if (isNaN(exLoans) || exLoans < 0 || exLoans > 10) errs.existingLoans = 'Enter 0 to 10 active loans';
    const obligations = parseFloat(loan.monthlyObligations);
    if (isNaN(obligations) || obligations < 0) errs.obligations = 'Enter valid monthly debt obligations';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation & Execution
  const validateAndSubmit = async () => {
    const errs: Record<string, string> = {};
    const score = parseInt(credit.score);
    if (isNaN(score) || score < 300 || score > 900) errs.score = 'Enter a valid CIBIL score between 300 and 900';
    const pay = parseFloat(credit.pay);
    if (isNaN(pay) || pay < 0 || pay > 100) errs.pay = 'Repayment history must be 0-100%';
    const util = parseFloat(credit.util);
    if (isNaN(util) || util < 0 || util > 100) errs.util = 'Card utilization must be 0-100%';
    const yrs = parseFloat(credit.yrs);
    if (isNaN(yrs) || yrs < 0 || yrs > 50) errs.yrs = 'History length must be 0-50 years';
    const enq = parseInt(credit.enq);
    if (isNaN(enq) || enq < 0 || enq > 20) errs.enq = 'Enquiries must be 0-20';
    if (!credit.consent) errs.consent = 'Your consent is required to perform credit risk verification';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create Application
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

      // 2. Verify Credit
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

      // 3. Trigger EBM ML Prediction
      const predictionData = await runPredictionApi(createdApp.id);
      setPredictionResult(predictionData);

      setStep(4);
    } catch (err: any) {
      console.error('Application pipeline failed:', err);
      setError(
        err.response?.data?.message || err.message || 'Underwriting pipeline encountered an error. Please try again.'
      );
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

  // Coaching tips tailored to outcome
  const getCoachingTips = () => {
    if (!predictionResult) return [];
    if (predictionResult.predicted_class === 'Approved') {
      return [
        '🌿 Keep your revolving card balances below 20% before submitting formal bank papers.',
        '📑 Gather 3 months of bank statements and your last 2 years of Form 16 / ITR.',
        '🌟 Your prime score puts you in line for the lowest available interest rate tier.',
      ];
    } else if (predictionResult.predicted_class === 'Needs Review') {
      return [
        '💡 Consider extending your loan tenure by 12–24 months to bring your monthly EMI into the optimal safe zone.',
        '💳 Pay down your highest-interest credit card balance to reduce credit utilization under 30%.',
        '💼 Providing audited income proof (ITR-V) or proof of supplementary income can help flip this to an approval.',
      ];
    } else {
      return [
        '🎯 Settle any past-due accounts or disputed records with your bank to stop negative CIBIL reporting.',
        '📉 Focus on reducing your total credit card utilization from ' + credit.util + '% to under 30% over the next 3 to 6 months.',
        '🤝 You can dramatically improve your eligibility by applying with an employed co-borrower or offering collateral.',
      ];
    }
  };

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto">
      {/* Title Header with warm welcoming tone */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cy/10 border border-cy/25 text-cy text-xs font-semibold uppercase tracking-wider mb-3">
          <HeartHandshake className="w-3.5 h-3.5" />
          Empathetic Financial Assessment
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">
          Loan <span className="text-cy">Eligibility</span> AI
        </h1>
        <p className="text-mute text-sm max-w-md mx-auto">
          Honest, transparent loan guidance with clear explanations and personalized financial tips
        </p>
      </div>

      {/* Progress Pills */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {[
          { num: 1, label: 'About You' },
          { num: 2, label: 'Loan Goals' },
          { num: 3, label: 'Credit Health' },
          { num: 4, label: 'Clear Decision' },
        ].map((item) => (
          <div
            key={item.num}
            className={`pill ${step === item.num ? 'on' : step > item.num ? 'done' : ''}`}
          >
            <b>{step > item.num ? '✓' : item.num}</b>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-bad/10 border border-bad/30 text-bad text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Multi-Step Card */}
      <div className="app-card p-6 sm:p-8">
        {/* STEP 1: About You */}
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-ink">First, tell us about yourself</h2>
              <span className="text-xs text-cy font-medium">Step 1 of 4</span>
            </div>
            <p className="text-mute text-xs mb-5">
              We look at your overall earning stability rather than just raw numbers.
            </p>

            {/* Persona Quick Buttons with human descriptions */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Try a sample profile:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => loadSample(s)}
                    className="p-3 rounded-xl bg-field hover:border-cy text-ink border border-line text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </div>
                    <div className="text-[10px] text-cy font-semibold mt-0.5">{s.tag}</div>
                    <div className="text-[10px] text-mute mt-1">{s.story}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-mute uppercase tracking-wider">
                    Full Name
                  </label>
                  <span className="text-[10px] text-dim">As shown on PAN / Aadhaar</span>
                </div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.name && <p className="text-bad text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-mute uppercase tracking-wider">
                    Your Age
                  </label>
                  <span className="text-[10px] text-dim">18–75 years</span>
                </div>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.age && <p className="text-bad text-[11px] mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Employment Stability
                </label>
                <select
                  value={profile.job}
                  onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                >
                  <option value="salaried">Salaried (Steady Monthly Paycheck)</option>
                  <option value="self">Self-Employed / Business Owner</option>
                  <option value="none">Currently Not Employed</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-mute uppercase tracking-wider">
                    Monthly Take-Home Income
                  </label>
                  <span className="text-[10px] text-ok">Net in-hand</span>
                </div>
                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.income && <p className="text-bad text-[11px] mt-1">{errors.income}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-mute uppercase tracking-wider">
                    Financial Dependents
                  </label>
                  <span className="text-[10px] text-dim">Family members</span>
                </div>
                <input
                  type="number"
                  value={profile.dep}
                  onChange={(e) => setProfile({ ...profile, dep: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.dep && <p className="text-bad text-[11px] mt-1">{errors.dep}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg hover:opacity-95 transition-opacity text-sm flex items-center justify-center gap-2"
              >
                Continue to Loan Goals
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loan Goals & Live Affordability Calculator */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-ink">What are your loan goals?</h2>
              <span className="text-xs text-cy font-medium">Step 2 of 4</span>
            </div>
            <p className="text-mute text-xs mb-5">
              Let's tailor the loan size and timeline to keep your monthly budget comfortable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Loan Amount (₹ Lakh)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={loan.amountLakhs}
                  onChange={(e) => setLoan({ ...loan, amountLakhs: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                <span className="text-[10px] text-cy block mt-1">
                  Principal: ₹{(parseFloat(loan.amountLakhs) * 100000 || 0).toLocaleString('en-IN')}
                </span>
                {errors.amount && <p className="text-bad text-[11px] mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Repayment Horizon
                </label>
                <select
                  value={loan.tenure}
                  onChange={(e) => setLoan({ ...loan, tenure: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                >
                  <option value="12">1 Year (12 Months - Fast Paydown)</option>
                  <option value="24">2 Years (24 Months)</option>
                  <option value="36">3 Years (36 Months - Popular)</option>
                  <option value="48">4 Years (48 Months)</option>
                  <option value="60">5 Years (60 Months - Low EMI)</option>
                  <option value="84">7 Years (84 Months)</option>
                  <option value="120">10 Years (120 Months - Long term)</option>
                  <option value="240">20 Years (240 Months - Home Loan)</option>
                </select>
                {errors.tenure && <p className="text-bad text-[11px] mt-1">{errors.tenure}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Loan Purpose
                </label>
                <select
                  value={loan.purpose}
                  onChange={(e) => setLoan({ ...loan, purpose: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                >
                  <option value="home">🏡 Home Purchase / Renovation</option>
                  <option value="business">💼 Business Growth / Equipment</option>
                  <option value="education">🎓 Education & Upskilling</option>
                  <option value="vehicle">🚗 Vehicle Purchase</option>
                  <option value="personal">🛍️ Personal & Medical Needs</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Active Existing Loans
                </label>
                <input
                  type="number"
                  value={loan.existingLoans}
                  onChange={(e) => setLoan({ ...loan, existingLoans: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.existingLoans && <p className="text-bad text-[11px] mt-1">{errors.existingLoans}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Existing Monthly Debt Obligations (₹)
                </label>
                <input
                  type="number"
                  value={loan.monthlyObligations}
                  onChange={(e) => setLoan({ ...loan, monthlyObligations: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.obligations && <p className="text-bad text-[11px] mt-1">{errors.obligations}</p>}
              </div>
            </div>

            {/* Humanized Live Affordability Card */}
            <div className="mt-5 p-4 rounded-xl bg-field/50 border border-line text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-cy" />
                  Your Affordability Preview (10.5% p.a.)
                </span>
                <span className="text-cyan-400 font-extrabold text-sm">
                  ₹{derived.emi.toLocaleString('en-IN')} / mo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center my-2">
                <div className="p-2.5 rounded-lg bg-card border border-line/60">
                  <div className="text-[10px] text-mute">Debt-to-Income (DTI)</div>
                  <div className={`text-base font-extrabold ${parseFloat(derived.dti) > 55 ? 'text-bad' : 'text-ok'}`}>
                    {derived.dti}%
                  </div>
                  <span className="text-[10px] text-dim block mt-0.5">
                    {parseFloat(derived.dti) <= 40 ? 'Safe & Manageable' : 'Approaching upper limit'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-card border border-line/60">
                  <div className="text-[10px] text-mute">Loan-to-Income (LTI)</div>
                  <div className={`text-base font-extrabold ${parseFloat(derived.lti) > 4 ? 'text-warn' : 'text-ok'}`}>
                    {derived.lti}x
                  </div>
                  <span className="text-[10px] text-dim block mt-0.5">Annual income multiple</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed bg-card/60 p-2.5 rounded-lg border border-line/40">
                {parseFloat(derived.dti) <= 45 ? (
                  <span>🌿 <strong>Looking great:</strong> Your estimated payment leaves ample room in your monthly cash flow for personal expenses and savings.</span>
                ) : (
                  <span>💡 <strong>Tip:</strong> You can lower your monthly commitment by extending your tenure to reduce payment pressure.</span>
                )}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl font-bold bg-field text-ink hover:bg-line/40 transition-colors text-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg hover:opacity-95 transition-opacity text-sm flex items-center justify-center gap-2"
              >
                Next: Credit Health
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Credit Health & CIBIL Verifier */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-ink">Let's check your credit health</h2>
              <span className="text-xs text-cy font-medium">Step 3 of 4</span>
            </div>
            <p className="text-mute text-xs mb-4">
              Your credit score reflects your past habits. Let's make sure everything matches up.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  CIBIL Score (300-900)
                </label>
                <input
                  type="number"
                  value={credit.score}
                  onChange={(e) => setCredit({ ...credit, score: e.target.value })}
                  placeholder="e.g. 740"
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.score && <p className="text-bad text-[11px] mt-1">{errors.score}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  On-Time Payments (%)
                </label>
                <input
                  type="number"
                  value={credit.pay}
                  onChange={(e) => setCredit({ ...credit, pay: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.pay && <p className="text-bad text-[11px] mt-1">{errors.pay}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Credit Card Utilization (%)
                </label>
                <input
                  type="number"
                  value={credit.util}
                  onChange={(e) => setCredit({ ...credit, util: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.util && <p className="text-bad text-[11px] mt-1">{errors.util}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Credit History Vintage (Years)
                </label>
                <input
                  type="number"
                  value={credit.yrs}
                  onChange={(e) => setCredit({ ...credit, yrs: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.yrs && <p className="text-bad text-[11px] mt-1">{errors.yrs}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-mute uppercase tracking-wider mb-1">
                  Recent Inquiries (Last 6 Months)
                </label>
                <input
                  type="number"
                  value={credit.enq}
                  onChange={(e) => setCredit({ ...credit, enq: e.target.value })}
                  className="w-full bg-field/60 border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-cy"
                />
                {errors.enq && <p className="text-bad text-[11px] mt-1">{errors.enq}</p>}
              </div>
            </div>

            {/* Interactive CIBIL Gauge with needle marker */}
            <CibilGauge
              score={parseInt(credit.score) || 300}
              paymentHistory={parseFloat(credit.pay) || 0}
              creditUtilization={parseFloat(credit.util) || 0}
              creditHistoryYears={parseFloat(credit.yrs) || 0}
              recentEnquiries={parseInt(credit.enq) || 0}
            />

            {/* Provider Mode Selection */}
            <div className="mt-4 p-3.5 rounded-xl bg-field/50 border border-line space-y-2">
              <span className="text-[10px] font-bold text-mute uppercase tracking-wider block">
                Verification Mode
              </span>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-card border border-line text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="providerMode"
                    checked={credit.providerMode === 'mock'}
                    onChange={() => setCredit({ ...credit, providerMode: 'mock' })}
                    className="accent-cy"
                  />
                  <span>
                    <strong className="block text-ink">Demo Mode</strong>
                    <span className="text-[10px] text-mute">Manual data (Unverified demo)</span>
                  </span>
                </label>
                <label className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-card border border-line text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="providerMode"
                    checked={credit.providerMode === 'verified'}
                    onChange={() => setCredit({ ...credit, providerMode: 'verified' })}
                    className="accent-cy"
                  />
                  <span>
                    <strong className="block text-ink">Bureau Gateway</strong>
                    <span className="text-[10px] text-mute">Authorized partner API</span>
                  </span>
                </label>
              </div>

              <div className="pt-2 border-t border-line/60">
                <label className="flex items-start gap-2 text-xs text-mute cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credit.consent}
                    onChange={(e) => setCredit({ ...credit, consent: e.target.checked })}
                    className="mt-0.5 accent-cy"
                  />
                  <span className="text-[11px] leading-relaxed">
                    I provide explicit consent for transparent credit evaluation and understand this is an AI advisory assessment.
                  </span>
                </label>
                {errors.consent && <p className="text-bad text-[11px] mt-1">{errors.consent}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="py-3 px-5 rounded-xl font-bold bg-field text-ink hover:bg-line/40 transition-colors text-sm disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={validateAndSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg hover:opacity-95 transition-opacity text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    Calculating Explainable Assessment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Clear Decision
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Humanized Explainable Assessment Result */}
        {step === 4 && predictionResult && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-ink">Your Explainable Loan Decision</h2>
              <span className="text-xs text-cy font-medium">Step 4 of 4</span>
            </div>
            <p className="text-mute text-xs mb-4">
              Here is exactly what drove our assessment for <strong>{profile.name}</strong>.
            </p>

            {/* Humanized Result Banner */}
            <div
              className={`p-4 rounded-2xl border mb-5 ${
                predictionResult.predicted_class === 'Approved'
                  ? 'bg-ok/10 border-ok/30'
                  : predictionResult.predicted_class === 'Needs Review'
                  ? 'bg-warn/10 border-warn/30'
                  : 'bg-bad/10 border-bad/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider ${
                      predictionResult.predicted_class === 'Approved'
                        ? 'text-ok'
                        : predictionResult.predicted_class === 'Needs Review'
                        ? 'text-warn'
                        : 'text-bad'
                    }`}
                  >
                    Outcome
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-black mt-0.5 ${
                      predictionResult.predicted_class === 'Approved'
                        ? 'text-ok'
                        : predictionResult.predicted_class === 'Needs Review'
                        ? 'text-warn'
                        : 'text-bad'
                    }`}
                  >
                    {predictionResult.predicted_class}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-mute block">Approval Likelihood</span>
                  <strong className="text-xl font-black text-ink">
                    {predictionResult.probabilityPercentage}%
                  </strong>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-line/40 text-xs text-slate-300 leading-relaxed">
                {predictionResult.predicted_class === 'Approved' && (
                  <span>🎉 <strong>Congratulations {profile.name}!</strong> Your debt-to-income balance and solid credit track record place you in our prime lending bracket.</span>
                )}
                {predictionResult.predicted_class === 'Needs Review' && (
                  <span>⚠️ <strong>Notice:</strong> Your application shows promise, but higher debt obligations or borderline credit factors indicate you would benefit from loan structuring.</span>
                )}
                {predictionResult.predicted_class === 'Declined' && (
                  <span>❌ <strong>Don't be discouraged {profile.name}:</strong> High financial exposure relative to income and credit history prevent approval today. Review the coaching roadmap below to build your score.</span>
                )}
              </div>
            </div>

            {/* Meter Bar */}
            <div className="meter">
              <i style={{ width: `${predictionResult.probabilityPercentage}%` }} />
            </div>

            {/* Low CIBIL Notice */}
            {parseInt(credit.score) < 550 && (
              <p className="text-bad text-xs font-semibold mb-3 bg-bad/10 p-2.5 rounded-xl border border-bad/20">
                A CIBIL score below 550 triggers a policy pause across Indian lenders. Clearing old dues is the fastest way to rebound.
              </p>
            )}

            {/* Mathematical Factor Attribution Bars */}
            <div className="my-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-mute flex items-center gap-1.5">
                  <span>🔍</span> Key Attributes Influencing Your Score:
                </h3>
                <span className="text-[10px] text-dim">
                  Left = Risk, Right = Strength
                </span>
              </div>

              {predictionResult.all_factors && predictionResult.all_factors.length > 0 ? (
                <div className="space-y-1">
                  {predictionResult.all_factors.slice(0, 5).map((factor: any, i: number) => (
                    <FactorBar key={i} factor={factor} />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-mute py-4">No detailed factors available.</div>
              )}
            </div>

            {/* Actionable Human Financial Coaching Tips Card */}
            <div className="p-4 rounded-xl bg-field/60 border border-line text-xs mb-5">
              <div className="flex items-center gap-2 font-bold text-cy mb-2 text-xs">
                <Lightbulb className="w-4 h-4 text-warn" />
                Actionable Financial Coaching:
              </div>
              <ul className="text-slate-300 text-[11px] space-y-1.5 pl-4 list-disc leading-relaxed">
                {getCoachingTips().map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Legal Disclaimer */}
            <p className="text-[11px] text-dim italic mb-6">
              {predictionResult.disclaimer ||
                'This assessment is an AI-assisted risk assessment for demonstration/research purposes and is not a guaranteed loan approval or denial.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="py-3 px-5 rounded-xl font-bold bg-field text-ink hover:bg-line/40 transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Another Scenario
              </button>
              {savedApplicationId && (
                <button
                  type="button"
                  onClick={() => navigate(`/applications/${savedApplicationId}`)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-cy to-blue-600 text-bg hover:opacity-95 transition-opacity text-xs flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Report & Audit Trail
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
