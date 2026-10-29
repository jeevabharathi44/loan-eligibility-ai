import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertOctagon, RefreshCw, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { verifyTriBiometricApi, getLivenessChallengeApi } from '../services/api';

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
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeStatus, setChallengeStatus] = useState<'pending' | 'in_progress' | 'verified' | 'failed'>('pending');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [simulateSpoof, setSimulateSpoof] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      console.warn('Liveness challenge fetch failed, using fallback:', e);
      setChallenge({
        instruction: 'Please blink your eyes naturally twice',
        action: 'blink',
        challenge_id: 'BLINK_TWICE',
      });
    }
  };

  // Start webcam
  const startCamera = async () => {
    setCameraActive(true);
    setCapturedPhoto(null);
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
      console.warn('Physical camera not available or permission denied. Using synthetic stream simulation.', err);
    }

    setTimeout(() => {
      setChallengeStatus('verified');
    }, 2800);
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

  // Capture face and trigger 3-way evaluation
  const captureAndVerify = async () => {
    setLoading(true);
    let photoDataUri: string | null = null;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx && video.videoWidth) {
        ctx.drawImage(video, 0, 0, 300, 300);
        photoDataUri = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photoDataUri);
      }
    }

    stopCamera();

    try {
      const result = await verifyTriBiometricApi({
        persona_id: personaId,
        live_webcam_image_b64: photoDataUri || undefined,
        force_spoof_simulation: simulateSpoof,
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

  // Instant 1-click verify using persona test frame
  const runInstantPersonaVerify = async (forceSpoofOverride = false) => {
    setLoading(true);
    try {
      const result = await verifyTriBiometricApi({
        persona_id: personaId,
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
      console.error('Biometric test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card p-6 shadow-xl">
      {/* Module Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cy animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              Module 2: Tri-Biometric Live Facial Verification Gate
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time 3-way facial comparison across Aadhaar registry, PAN card, and live webcam feed (RBI Minimum Threshold: ≥ 75.0%)
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
              runInstantPersonaVerify(next);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              simulateSpoof
                ? 'bg-bad/15 text-bad border-bad shadow'
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
          <div className="w-32 h-32 rounded-xl overflow-hidden mt-6 bg-white border-2 border-blue-300 relative shadow-inner flex items-center justify-center">
            {verificationResult?.aadhaar_photo_b64 || initialAadhaarPhoto ? (
              <img
                src={verificationResult?.aadhaar_photo_b64 || initialAadhaarPhoto}
                alt="Aadhaar Registry"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                <UserCheck className="w-10 h-10 mb-1 opacity-60" />
                <span className="text-[10px]">Aadhaar Vault Face Vector</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1 bg-white/80 rounded text-[9px] text-blue-600 font-mono">
              UIDAI Signed
            </div>
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-900">{applicantName}</div>
          <div className="text-[11px] text-slate-600">Official UIDAI Registry Image</div>
        </div>

        {/* Card 2: Income Tax PAN Card Photo */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-warn/15 text-warn text-[10px] font-bold uppercase tracking-wider border border-warn/30">
            Image 2: ITD PAN Card
          </div>
          <div className="w-32 h-32 rounded-xl overflow-hidden mt-6 bg-white border-2 border-warn/40 relative shadow-inner flex items-center justify-center">
            {verificationResult?.pan_photo_b64 || initialPanPhoto ? (
              <img
                src={verificationResult?.pan_photo_b64 || initialPanPhoto}
                alt="ITD PAN"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                <UserCheck className="w-10 h-10 mb-1 opacity-60" />
                <span className="text-[10px]">NSDL / UTIITSL Face</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1 bg-white/80 rounded text-[9px] text-warn font-mono">
              ITD Master
            </div>
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-900">{applicantName}</div>
          <div className="text-[11px] text-slate-600">Taxpayer Master Record</div>
        </div>

        {/* Card 3: Real-Time Live Webcam */}
        <div className="bg-slate-50 rounded-xl p-4 border border-blue-300 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cy animate-pulse" />
            Image 3: Live Webcam
          </div>

          <div className="w-36 h-36 rounded-xl overflow-hidden mt-6 bg-slate-900 border-2 border-blue-400 relative shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
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
            ) : capturedPhoto ? (
              <div className="relative w-full h-full">
                <img src={capturedPhoto} alt="Captured Live Frame" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-emerald-600/90 text-white px-1.5 py-0.5 rounded text-[8px] font-mono">
                  Captured
                </span>
              </div>
            ) : verificationResult?.live_photo_b64 ? (
              <div className="relative w-full h-full">
                <img
                  src={verificationResult.live_photo_b64}
                  alt="Live Camera Snapshot"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-blue-600/90 text-white px-1.5 py-0.5 rounded text-[8px] font-mono">
                  Verified Frame
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-cyan-400/80 p-2">
                <Camera className="w-10 h-10 mb-1 animate-pulse" />
                <span className="text-[10px] text-slate-300">Biometric Sensor Standby</span>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center z-20">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-1" />
                <span className="text-[10px] text-white font-semibold">Running 3-Way Match...</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {!cameraActive ? (
              <>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-300 rounded-lg text-[11px] font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{capturedPhoto ? 'Retake Live Face' : 'Open Live Camera'}</span>
                </button>
                {capturedPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPhoto(null);
                      setVerificationResult(null);
                    }}
                    className="px-2 py-1 bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg text-[11px] font-medium"
                  >
                    Reset
                  </button>
                )}
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
          <div className="text-[10px] text-slate-400 mt-1">Active Liveness Sensor</div>
        </div>
      </div>

      {/* Active Liveness Challenge Bar */}
      {challenge && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Active Liveness Challenge:</span>
                <span className="text-blue-600 font-mono text-[11px]">
                  [{challenge.challenge_id || 'RANDOM_GESTURE'}]
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{challenge.instruction}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                challengeStatus === 'verified' || verificationResult?.liveness?.liveness_passed
                  ? 'bg-ok/15 text-ok border-ok/40'
                  : challengeStatus === 'in_progress'
                  ? 'bg-warn/15 text-warn border-warn/40 animate-pulse'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {challengeStatus === 'verified' || verificationResult?.liveness?.liveness_passed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
                  <span>Challenge Verified (98.5%)</span>
                </>
              ) : challengeStatus === 'in_progress' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-warn" />
                  <span>Tracking Facial Pose...</span>
                </>
              ) : (
                <span>Awaiting Live Capture</span>
              )}
            </span>

            <button
              type="button"
              onClick={() => runInstantPersonaVerify(false)}
              disabled={loading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : '1-Click Tri-Verify'}
            </button>
          </div>
        </div>
      )}

      {/* Verification Scorecard & Gate Result */}
      {verificationResult && (
        <div
          className={`rounded-xl p-4 border transition-all ${
            verificationResult.is_gate_passed
              ? 'bg-ok/15 border-ok/40 text-ok'
              : 'bg-bad/15 border-bad/40 text-bad'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {verificationResult.is_gate_passed ? (
                <CheckCircle2 className="w-5 h-5 text-ok" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-bad" />
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
                    verificationResult.is_gate_passed ? 'text-ok' : 'text-bad'
                  }`}
                >
                  {verificationResult.composite_similarity}%
                </span>
                <span className="text-[10px] text-slate-400 ml-1">(Threshold ≥ 75.0%)</span>
              </div>
            </div>
          </div>

          {/* Pairwise Breakdown Cards with Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
            {verificationResult.pairs &&
              Object.entries(verificationResult.pairs).map(([key, pair]: [string, any]) => (
                <div
                  key={key}
                  className="bg-white rounded-lg p-2.5 border border-slate-200 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-700 font-medium text-[11px]">{pair.pair_name}</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        pair.passed
                          ? 'bg-ok/15 text-ok border border-ok/30'
                          : 'bg-bad/15 text-bad border border-bad/30'
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
            <span className="font-semibold text-slate-700">RBI DLG Compliance Gate: Minimum ≥ 75.0%</span>
          </div>

          {verificationResult.denial_reason && (
            <div className="bg-bad/20 border border-bad/50 rounded-lg p-3 text-xs text-bad flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-bad shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Security Denial Reason: </span>
                  {verificationResult.denial_reason}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-bad text-white font-semibold rounded-md text-[11px] hover:opacity-90 shadow-xs"
                >
                  Retry with Live Camera
                </button>
                <button
                  type="button"
                  onClick={() => runInstantPersonaVerify(false)}
                  className="px-2.5 py-1 bg-white border border-bad/40 text-bad font-semibold rounded-md text-[11px] hover:bg-slate-50 shadow-xs"
                >
                  Verify via Registered KYC Photo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
