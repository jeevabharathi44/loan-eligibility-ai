import React, { useState } from 'react';
import { AshokaEmblem } from '../components/AshokaEmblem';
import { MeriPehchaanBrand } from '../components/MeriPehchaanBrand';
import { PersonaSelectorBar } from '../components/PersonaSelectorBar';
import {
  Smartphone,
  User,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  requestMobileOtpApi,
  verifyMobileOtpApi,
  signinUsernamePinApi,
  signinOtherIdApi,
  getPersonaKycApi,
} from '../services/api';

interface MeriPehchaanSSOPageProps {
  navigate: (path: string) => void;
  onLoginSuccess?: (userData: any) => void;
}

export const MeriPehchaanSSOPage: React.FC<MeriPehchaanSSOPageProps> = ({ navigate, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'username' | 'other_id'>('mobile');
  const [activePersona, setActivePersona] = useState<string>('jeeva_bharathi');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Mode 1: Mobile + OTP
  const [mobileNumber, setMobileNumber] = useState<string>('9876543210');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('123456');

  // Mode 2: Username + PIN
  const [username, setUsername] = useState<string>('jeeva_bharathi');
  const [securityPin, setSecurityPin] = useState<string>('123456');

  // Mode 3: Other ID
  const [idType, setIdType] = useState<'AADHAAR' | 'PAN' | 'DRIVING_LICENSE'>('AADHAAR');
  const [idNumber, setIdNumber] = useState<string>('XXXXXXXX4892');

  // Cryptographic XML Modal state
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [xmlData, setXmlData] = useState<any>(null);

  // Handle persona selection
  const handleSelectPersona = async (personaId: string) => {
    setActivePersona(personaId);
    setError('');
    if (personaId === 'jeeva_bharathi') {
      setMobileNumber('9876543210');
      setUsername('jeeva_bharathi');
      setIdNumber('XXXXXXXX4892');
    } else if (personaId === 'jeeva_b') {
      setMobileNumber('9876543211');
      setUsername('jeeva_b');
      setIdNumber('XXXXXXXX4892');
    } else if (personaId === 'karthik_raman') {
      setMobileNumber('9876543212');
      setUsername('karthik_raman');
      setIdNumber('XXXXXXXX9134');
    }
  };

  // Inspect Cryptographic XML e-Aadhaar
  const handleInspectXml = async () => {
    setLoading(true);
    try {
      const data = await getPersonaKycApi(activePersona);
      setXmlData(data);
      setShowXmlModal(true);
    } catch (err: any) {
      console.error('Failed to retrieve e-Aadhaar XML:', err);
      setError('Could not retrieve cryptographic XML from DigiLocker repository.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Mobile OTP Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestMobileOtpApi(mobileNumber);
      setOtpSent(true);
      setOtpValue('123456'); // pre-fill demo OTP
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Authenticate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyMobileOtpApi(mobileNumber, otpValue);
      localStorage.setItem('loan_xai_token', res.access_token);
      localStorage.setItem('loan_ai_token', res.access_token);
      localStorage.setItem('loan_xai_user', JSON.stringify(res.user));
      localStorage.setItem('selected_persona_id', activePersona);
      if (onLoginSuccess) onLoginSuccess(res.user);
      navigate('/apply');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Username & PIN
  const handleUsernamePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signinUsernamePinApi(username, securityPin);
      localStorage.setItem('loan_xai_token', res.access_token);
      localStorage.setItem('loan_ai_token', res.access_token);
      localStorage.setItem('loan_xai_user', JSON.stringify(res.user));
      if (res.user.role === 'CHIEF_UNDERWRITER') {
        navigate('/admin');
      } else {
        localStorage.setItem('selected_persona_id', activePersona);
        navigate('/apply');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Other ID
  const handleOtherIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signinOtherIdApi(idType, idNumber);
      localStorage.setItem('loan_xai_token', res.access_token);
      localStorage.setItem('loan_ai_token', res.access_token);
      localStorage.setItem('loan_xai_user', JSON.stringify(res.user));
      localStorage.setItem('selected_persona_id', activePersona);
      navigate('/apply');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'ID verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Benchmark Persona Quick-Select Bar */}
      <PersonaSelectorBar
        activePersonaId={activePersona}
        onSelectPersona={handleSelectPersona}
        onNavigateToCockpit={() => {
          setUsername('emp-90421');
          setSecurityPin('90421');
          setActiveTab('username');
        }}
      />

      {/* Official Government of India Top Banner */}
      <div className="bg-white/90 border-b border-slate-200 py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AshokaEmblem size={34} />
            <div className="hidden sm:block">
              <span className="text-[11px] font-serif font-bold text-slate-900 block">
                भारत सरकार | Government of India
              </span>
              <span className="text-[10px] text-slate-600">
                Ministry of Electronics & Information Technology (MeitY)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="hidden md:inline font-mono text-[11px] text-blue-600">
              digilocker.meripehchaan.gov.in
            </span>
            <div className="h-4 w-px bg-line" />
            <span className="font-semibold text-slate-900">English</span>
            <span className="text-slate-400">|</span>
            <span className="hover:text-slate-900 cursor-pointer">हिन्दी</span>
          </div>
        </div>
      </div>

      {/* Main Single Sign-On Gateway Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="app-card w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Tri-Color Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

          {/* Meri Pehchaan Branding */}
          <div className="mb-6">
            <MeriPehchaanBrand />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Sign In to Your National Account</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Access RBI-Regulated Digital Personal Loan Services via Digital Public Infrastructure (DPI)
            </p>
          </div>

          {/* 3 Sign-in Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'mobile'
                  ? 'bg-white text-blue-600 border border-slate-200 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (+91)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('username')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'username'
                  ? 'bg-white text-blue-600 border border-slate-200 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Username</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('other_id')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'other_id'
                  ? 'bg-white text-blue-600 border border-slate-200 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Other ID</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-bad/10 border border-bad/30 flex items-center gap-2 text-bad text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-bad shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Mobile + OTP Form */}
          {activeTab === 'mobile' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                      Mobile Number (Linked with Aadhaar)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600 text-xs font-bold font-mono">
                        +91
                      </div>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-mono text-slate-900 placeholder-dim focus:outline-none focus:border-cy"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                      <input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-cy" />
                      <span>Remember my device</span>
                    </label>
                    <span className="text-blue-600 hover:underline cursor-pointer">Help?</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                    <span>Generate Meri Pehchaan OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-900">
                        Enter 6-Digit OTP sent to +91 {mobileNumber}
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      maxLength={6}
                      placeholder="123456"
                      required
                      className="w-full bg-slate-50 border-2 border-cy rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-900 focus:outline-none shadow-sm"
                    />
                    <div className="mt-1.5 text-[11px] text-ok flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Demo OTP auto-filled: 123456</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-ok hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-ok/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ShieldCheck className="w-4 h-4 text-white" />}
                    <span>Verify & Authenticate via DigiLocker</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mode 2: Username + PIN Form */}
          {activeTab === 'username' && (
            <form onSubmit={handleUsernamePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  DigiLocker Username / Officer ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jeeva_bharathi or emp-90421"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-dim focus:outline-none focus:border-cy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  6-Digit Security PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-slate-900 placeholder-dim focus:outline-none focus:border-cy"
                  />
                </div>
                {username.toLowerCase().includes('90421') && (
                  <div className="text-[11px] text-blue-600 mt-1 font-medium">
                    🏛️ Chief Underwriter & Auditor Demo Credentials Loaded (Dr. Arulmozhi Varman)
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                <span>Sign In with Meri Pehchaan</span>
              </button>
            </form>
          )}

          {/* Mode 3: Other ID (Aadhaar / PAN / DL) */}
          {activeTab === 'other_id' && (
            <form onSubmit={handleOtherIdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Select National Document ID
                </label>
                <select
                  value={idType}
                  onChange={(e: any) => setIdType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cy"
                >
                  <option value="AADHAAR">UIDAI Aadhaar Number / Virtual ID (VID)</option>
                  <option value="PAN">Income Tax Department PAN Number</option>
                  <option value="DRIVING_LICENSE">Ministry of Road Transport Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  ID Number
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={idType === 'PAN' ? 'ABCDE1234F' : 'XXXXXXXX4892'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 placeholder-dim focus:outline-none focus:border-cy"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                🔒 Cryptographic consent: By proceeding, you authorize retrieval of UIDAI-signed XML and ITD PAN records for underwriting under RBI Digital Lending Guidelines.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                <span>Fetch Cryptographic Credentials</span>
              </button>
            </form>
          )}

          {/* Cryptographic XML e-Aadhaar Inspector Trigger */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleInspectXml}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-semibold"
            >
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Inspect Cryptographic e-Aadhaar XML</span>
            </button>

            <span className="text-[10px] text-slate-600 font-mono">
              UIDAI Digital Signature Valid
            </span>
          </div>
        </div>
      </div>

      {/* Cryptographic XML Inspection Modal */}
      {showXmlModal && xmlData && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Cryptographic XML e-Aadhaar & ITD PAN Master Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowXmlModal(false)}
                className="text-slate-600 hover:text-slate-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              {/* Certificate Verification Badge */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-ok font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UIDAI SHA-256 Digital Signature Verified</span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Issuer CN: {xmlData.e_aadhaar_xml.cert_cn}
                </div>
                <div className="text-[11px] text-slate-600 font-mono truncate">
                  SHA-256 Hash: {xmlData.e_aadhaar_xml.sha256_hash}
                </div>
              </div>

              {/* Raw Signed XML Preview */}
              <div>
                <label className="block text-slate-900 font-semibold mb-1">
                  Decrypted UIDAI e-KYC 2.1 XML Payload:
                </label>
                <pre className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-900 overflow-x-auto leading-relaxed">
                  {xmlData.e_aadhaar_xml.xml_raw}
                </pre>
              </div>

              {/* ITD PAN Master Record */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-warn font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Income Tax Department (ITD) Master Record</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-900 font-mono">
                  <div>PAN: {xmlData.itd_pan_master.pan}</div>
                  <div>Status: {xmlData.itd_pan_master.pan_status}</div>
                  <div>Taxpayer: {xmlData.itd_pan_master.name_on_card}</div>
                  <div>AO Code: {xmlData.itd_pan_master.ao_code}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowXmlModal(false)}
                className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-semibold border border-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
