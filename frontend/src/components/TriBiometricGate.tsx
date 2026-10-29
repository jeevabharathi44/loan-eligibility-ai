import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Upload,
  Play,
  RotateCcw,
} from 'lucide-react';
import { verifyTriBiometricApi, getLivenessChallengeApi } from '../services/api';
import { JEEVA_AADHAAR_B64, JEEVA_PAN_B64 } from '../services/photo_constants';

interface TriBiometricGateProps {
  personaId: string;
  applicantName: string;
  initialAadhaarPhoto?: string;
  initialPanPhoto?: string;
  onVerificationComplete: (result: {
    passed: boolean;
    compositeSimilarity: number;
    pairs: any;
    status: string;
  }) => void;
}

export const TriBiometricGate: React.FC<TriBiometricGateProps> = ({
  personaId,
  applicantName,
  initialAadhaarPhoto,
  initialPanPhoto,
  onVerificationComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [aadhaarPhoto, setAadhaarPhoto] = useState<string>(initialAadhaarPhoto || JEEVA_AADHAAR_B64);
  const [panPhoto, setPanPhoto] = useState<string>(initialPanPhoto || JEEVA_PAN_B64);
  const [livePhoto, setLivePhoto] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeStatus, setChallengeStatus] = useState<'pending' | 'in_progress' | 'verified' | 'failed'>('pending');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [simulateSpoof, setSimulateSpoof] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aadhaarFileRef = useRef<HTMLInputElement>(null);
  const panFileRef = useRef<HTMLInputElement>(null);
  const liveFileRef = useRef<HTMLInputElement>(null);

  // Sync initial photos if props change
  useEffect(() => {
    if (initialAadhaarPhoto) setAadhaarPhoto(initialAadhaarPhoto);
    if (initialPanPhoto) setPanPhoto(initialPanPhoto);
  }, [initialAadhaarPhoto, initialPanPhoto]);

  // Fetch initial liveness challenge
  useEffect(() => {
    loadLivenessChallenge();
  }, [personaId]);

  const loadLivenessChallenge = async () => {
    try {
      const ch = await getLivenessChallengeApi();
      setChallenge(ch);
      setChallengeStatus('pending');
    } catch (e) {
      console.warn('Liveness challenge fetch fallback:', e);
      setChallenge({
        instruction: 'Please look directly at the sensor and blink naturally twice',
        action: 'blink',
        challenge_id: 'BLINK_TWICE',
      });
    }
  };

  // Start webcam
  const startCamera = async () => {
    setCameraActive(true);
    setLivePhoto(null);
    setVerificationResult(null);
    setChallengeStatus('in_progress');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 400, height: 400, facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera stream permission unavailable, user can upload photo directly from disk:', err);
    }

    setTimeout(() => {
      setChallengeStatus('verified');
    }, 2500);
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Handle local file upload for Aadhaar, PAN, or Live Photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'aadhaar' | 'pan' | 'live') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (target === 'aadhaar') {
        setAadhaarPhoto(b64);
        runTriBiometricVerification(livePhoto, b64, panPhoto, simulateSpoof);
      } else if (target === 'pan') {
        setPanPhoto(b64);
        runTriBiometricVerification(livePhoto, aadhaarPhoto, b64, simulateSpoof);
      } else if (target === 'live') {
        setLivePhoto(b64);
        runTriBiometricVerification(b64, aadhaarPhoto, panPhoto, simulateSpoof);
      }
    };
    reader.readAsDataURL(file);
  };

  // Capture face from webcam and trigger 3-way evaluation
  const captureAndVerify = async () => {
    setLoading(true);
    let photoDataUri: string | null = null;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx && (video.videoWidth || video.readyState >= 2)) {
        ctx.drawImage(video, 0, 0, 300, 300);
        photoDataUri = canvas.toDataURL('image/jpeg');
      }
    }

    stopCamera();

    if (photoDataUri) {
      setLivePhoto(photoDataUri);
    }

    await runTriBiometricVerification(photoDataUri || livePhoto, aadhaarPhoto, panPhoto, simulateSpoof);
  };

  // Core 3-way verification runner
  const runTriBiometricVerification = async (
    liveToUse?: string | null,
    aadhaarToUse?: string,
    panToUse?: string,
    forceSpoofOverride = false
  ) => {
    setLoading(true);
    try {
      const result = await verifyTriBiometricApi({
        persona_id: personaId,
        aadhaar_photo_b64: aadhaarToUse || aadhaarPhoto,
        pan_photo_b64: panToUse || panPhoto,
        live_webcam_image_b64: (liveToUse !== undefined ? liveToUse : livePhoto) || undefined,
        force_spoof_simulation: forceSpoofOverride,
      });

      setVerificationResult(result);
      onVerificationComplete({
        passed: result.is_gate_passed,
        compositeSimilarity: result.composite_similarity,
        pairs: result.pairs,
        status: result.status,
      });
    } catch (err) {
      console.error('Biometric verification failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card p-6 shadow-xl bg-white border border-slate-200 rounded-2xl">
      {/* Hidden File Inputs for Local Drive Photo Uploads */}
      <input
        type="file"
        ref={aadhaarFileRef}
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'aadhaar')}
        className="hidden"
      />
      <input
        type="file"
        ref={panFileRef}
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'pan')}
        className="hidden"
      />
      <input
        type="file"
        ref={liveFileRef}
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'live')}
        className="hidden"
      />

      {/* Module Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              Module 2: Tri-Biometric Live Facial Verification Gate
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time 3-way facial comparison across Aadhaar registry, PAN card, and live applicant photo (RBI Minimum Threshold: ≥ 75.0%)
          </p>
        </div>

        {/* Spoof Simulation Toggle for Viva Examiner */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-600">Viva Defense Mode:</span>
          <button
            type="button"
            onClick={() => {
              const next = !simulateSpoof;
              setSimulateSpoof(next);
              runTriBiometricVerification(livePhoto, aadhaarPhoto, panPhoto, next);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              simulateSpoof
                ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            {simulateSpoof ? '⚠️ Spoof Simulation Active (<75%)' : 'Normal Authenticated Mode'}
          </button>
        </div>
      </div>

      {/* 3 Photo Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Aadhaar Registry Photo */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
            Image 1: UIDAI Aadhaar
          </div>
          <div className="w-36 h-36 rounded-xl overflow-hidden mt-6 bg-white border-2 border-blue-300 relative shadow-inner flex items-center justify-center">
            {aadhaarPhoto ? (
              <img src={aadhaarPhoto} alt="Aadhaar Registry" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                <UserCheck className="w-10 h-10 mb-1 opacity-60" />
                <span className="text-[10px]">Aadhaar Vault Face</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1 bg-white/90 rounded text-[9px] text-blue-600 font-mono">
              UIDAI Master
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-900">{applicantName}</div>
          <div className="text-[11px] text-slate-500 mb-2">UIDAI Official Photo</div>
          <button
            type="button"
            onClick={() => aadhaarFileRef.current?.click()}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 shadow-2xs"
          >
            <Upload className="w-3 h-3 text-slate-500" />
            <span>Upload Aadhaar Photo</span>
          </button>
        </div>

        {/* Card 2: Income Tax PAN Card Photo */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
            Image 2: ITD PAN Card
          </div>
          <div className="w-36 h-36 rounded-xl overflow-hidden mt-6 bg-white border-2 border-amber-300 relative shadow-inner flex items-center justify-center">
            {panPhoto ? (
              <img src={panPhoto} alt="ITD PAN" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                <UserCheck className="w-10 h-10 mb-1 opacity-60" />
                <span className="text-[10px]">NSDL / UTIITSL Face</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1 bg-white/90 rounded text-[9px] text-amber-700 font-mono">
              ITD Master
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-900">{applicantName}</div>
          <div className="text-[11px] text-slate-500 mb-2">Taxpayer Master Record</div>
          <button
            type="button"
            onClick={() => panFileRef.current?.click()}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 shadow-2xs"
          >
            <Upload className="w-3 h-3 text-slate-500" />
            <span>Upload PAN Photo</span>
          </button>
        </div>

        {/* Card 3: Real-Time Live Webcam / Uploaded Selfie */}
        <div className="bg-slate-50 rounded-xl p-4 border border-blue-300 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-300 flex items-center gap-1 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Image 3: Live Sensor
          </div>

          <div className="w-36 h-36 rounded-xl overflow-hidden mt-6 bg-slate-900 border-2 border-blue-400 relative shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {/* Facial Oval Alignment Reticle */}
                <div className="absolute inset-2 border-2 border-dashed border-cyan-400 rounded-[50%] pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full absolute top-7 left-9 shadow-[0_0_6px_#22d3ee] animate-ping" />
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full absolute top-7 right-9 shadow-[0_0_6px_#22d3ee] animate-ping" />
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full absolute top-14 shadow-[0_0_6px_#22d3ee]" />
                  <span className="w-3 h-1 bg-cyan-300/80 rounded-full absolute bottom-8 shadow-[0_0_6px_#22d3ee]" />
                </div>
                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-pulse pointer-events-none top-1/2" />
                <span className="absolute bottom-1 bg-black/75 backdrop-blur-sm text-cyan-300 px-2 py-0.5 rounded text-[8px] font-mono">
                  Align Face in Oval
                </span>
              </div>
            ) : livePhoto ? (
              <div className="relative w-full h-full">
                <img src={livePhoto} alt="Captured Live Frame" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-emerald-600/90 text-white px-1.5 py-0.5 rounded text-[8px] font-mono">
                  Live Active
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-cyan-400/80 p-2">
                <Camera className="w-10 h-10 mb-1 animate-pulse" />
                <span className="text-[10px] text-slate-300">Camera / Selfie Standby</span>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center z-20">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-1" />
                <span className="text-[10px] text-white font-semibold">Running 3-Way ML Match...</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Camera & Upload Controls */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
            {!cameraActive ? (
              <>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-300 rounded-lg text-[11px] font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{livePhoto ? 'Retake via Camera' : 'Open Live Camera'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => liveFileRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Live Photo</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={captureAndVerify}
                  disabled={loading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-md animate-pulse disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>Capture & Verify Face</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-2 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-[10px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Liveness & Biometric Sensor</div>
        </div>
      </div>

      {/* Main Verification Trigger & Liveness Status Bar */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Biometric Sensor Active Challenge:</span>
              <span className="text-blue-600 font-mono text-[11px]">
                [{challenge?.challenge_id || 'RANDOM_GESTURE'}]
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {challenge?.instruction || 'Center your face naturally to authenticate against official registry cards.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
              verificationResult?.is_gate_passed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : challengeStatus === 'in_progress'
                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {verificationResult?.is_gate_passed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified ({verificationResult.composite_similarity}%)</span>
              </>
            ) : challengeStatus === 'in_progress' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Tracking Landmarks...</span>
              </>
            ) : (
              <span>Ready for Verification</span>
            )}
          </span>

          <button
            type="button"
            onClick={() => runTriBiometricVerification(livePhoto, aadhaarPhoto, panPhoto, false)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{loading ? 'Evaluating...' : 'Verify Tri-Biometric Match'}</span>
          </button>
        </div>
      </div>

      {/* Verification Scorecard & Gate Result */}
      {verificationResult && (
        <div
          className={`rounded-xl p-4 border transition-all ${
            verificationResult.is_gate_passed
              ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {verificationResult.is_gate_passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              )}
              <h4 className="font-bold text-sm">
                {verificationResult.is_gate_passed
                  ? 'Tri-Biometric Identity Authenticated — Gate Passed ✅'
                  : 'Biometric Gate Violation — Security Denial Triggered ❌'}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-600">Composite Similarity: </span>
                <span
                  className={`text-base font-black font-mono ${
                    verificationResult.is_gate_passed ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {verificationResult.composite_similarity}%
                </span>
                <span className="text-[10px] text-slate-500 ml-1">(RBI Threshold ≥ 75.0%)</span>
              </div>
            </div>
          </div>

          {/* Pairwise Breakdown Cards with Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
            {verificationResult.pairs &&
              Object.entries(verificationResult.pairs).map(([key, pair]: [string, any]) => (
                <div
                  key={key}
                  className="bg-white rounded-lg p-2.5 border border-slate-200 flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-700 font-medium text-[11px]">{pair.pair_name}</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        pair.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {pair.similarity_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pair.passed ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, pair.similarity_percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mb-3 px-1 gap-2">
            <span>Model: 0.40(PAN:Live) + 0.35(Aadhaar:Live) + 0.25(Aadhaar:PAN)</span>
            <span className="font-semibold text-slate-700">RBI Digital Lending Gate: Minimum ≥ 75.0%</span>
          </div>

          {verificationResult.denial_reason && (
            <div className="bg-rose-100/60 border border-rose-300 rounded-lg p-3 text-xs text-rose-900 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Security Denial Reason: </span>
                  {verificationResult.denial_reason}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-rose-600 text-white font-semibold rounded-md text-[11px] hover:bg-rose-700 shadow-2xs"
                >
                  Retry with Live Camera
                </button>
                <button
                  type="button"
                  onClick={() => liveFileRef.current?.click()}
                  className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 font-semibold rounded-md text-[11px] hover:bg-slate-50 shadow-2xs"
                >
                  Upload Matching Photo File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
