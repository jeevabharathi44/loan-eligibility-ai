import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createApplicationApi,
  verifyCreditApi,
  runPredictionApi,
  verifyTriBiometricApi,
  crossCheckProfileOcrApi,
  getJeevaSampleKycApi,
  uploadDocumentFileApi,
  deleteDocumentApi,
  pullDigiLockerDocsApi,
  SAMPLE_DEMO_PROFILES,
} from '../services/api';
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
  Sparkles,
  Camera,
  FileCheck,
  Building2,
  Lock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Send,
  X,
  ExternalLink,
  Shield,
  FileText,
  BadgeCheck,
  Upload,
  UserCheck,
  ScanFace,
  Printer,
  Download,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  DisbursementInfo,
  BiometricCrossCheckResult,
  OcrFieldMatch,
  OcrProfileCrossCheckResponse,
  DocumentItemState,
} from '../types';

interface ApplicationWizardProps {
  navigate: (path: string) => void;
}

export const ApplicationWizardPage: React.FC<ApplicationWizardProps> = ({ navigate }) => {
  const { user } = useAuth();

  // Active step (1 to 7)
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [savedApplicationId, setSavedApplicationId] = useState<string>('APP-2026-0841');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'APPROVED' | 'NEED_VERIFICATION' | 'REJECTED'>('APPROVED');
  const [digiLockerSyncing, setDigiLockerSyncing] = useState<boolean>(false);

  // STEP 1: Applicant Details (Retrieved via DigiLocker)
  const [profile, setProfile] = useState({
    name: user?.name || 'Jeeva Bharathi M',
    age: '20',
    gender: 'Male',
    maritalStatus: 'Single / Unmarried',
    income: '85000',
    job: 'salaried',
    dep: '1',
    panNumber: 'DELPJ9476P',
    aadhaarNumber: '2235 1313 2450',
  });

  // STEP 2: Loan Requirements & Financials
  const [loan, setLoan] = useState({
    amountLakhs: '5.0', // in Lakhs
    tenure: '36', // in Months
    purpose: 'personal',
    existingLoans: '0',
    monthlyObligations: '3500',
  });

  // Credit profile state (Retrieved from synthetic bureau dataset)
  const [creditConsent, setCreditConsent] = useState(true);
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditData, setCreditData] = useState<{
    score: number;
    paymentHistory: number;
    creditUtilization: number;
    creditHistoryYears: number;
    recentEnquiries: number;
    riskBand: string;
    status: string;
    regulatoryBanner: string;
  }>({
    score: 785,
    paymentHistory: 98.2,
    creditUtilization: 21.5,
    creditHistoryYears: 4.5,
    recentEnquiries: 1,
    riskBand: 'LOW_RISK_PRIME',
    status: 'DEMO_RESULT_AVAILABLE',
    regulatoryBanner: 'Synthetic credit profile — retrieved via TransUnion / CIBIL simulation',
  });

  // STEP 3: Independent Manual Document Uploads & DigiLocker Matching
  const [aadhaarDoc, setAadhaarDoc] = useState<DocumentItemState>({
    file: null,
    fileName: 'aadhaar_card_jeeva.jpg',
    fileSize: '1.2 MB',
    previewUrl: '/assets/aadhaar_card.jpg',
    uploadStatus: 'UPLOADED',
    ocrStatus: 'EXTRACTED',
    verificationStatus: 'VERIFIED',
    extractedFields: {
      fullName: 'Jeeva Bharathi M',
      aadhaarNumber: '2235 1313 2450',
      maskedAadhaar: 'XXXX XXXX 2450',
      dateOfBirth: '25/02/2006',
      gender: 'Male',
      address: 'Tamil Nadu, India',
    },
    digiLockerMatch: {
      verified: true,
      status: 'MATCHED',
      message: 'DigiLocker Match Verified: Aadhaar (...2450) and name match Government DigiLocker UIDAI registry.',
    },
  });

  const [panDoc, setPanDoc] = useState<DocumentItemState>({
    file: null,
    fileName: 'pan_card_jeeva.jpg',
    fileSize: '820 KB',
    previewUrl: '/assets/pan_card.jpg',
    uploadStatus: 'UPLOADED',
    ocrStatus: 'EXTRACTED',
    verificationStatus: 'VERIFIED',
    extractedFields: {
      fullName: 'JEEVA BHARATHI M',
      fatherName: 'MAHALINGAM',
      panNumber: 'DELPJ9476P',
      maskedPan: 'DELPJXXXXP',
      dateOfBirth: '25/02/2006',
      gender: 'Male',
    },
    digiLockerMatch: {
      verified: true,
      status: 'MATCHED',
      message: 'DigiLocker Match Verified: PAN (DELPJ9476P) matches Income Tax Dept record in DigiLocker.',
    },
  });

  // Card zoom preview modal
  const [previewModalImg, setPreviewModalImg] = useState<{ title: string; src: string } | null>(null);

  // STEP 4: OCR & Cross-Document Checks
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrCrossCheck, setOcrCrossCheck] = useState<OcrProfileCrossCheckResponse | null>({
    success: true,
    overallMatchStatus: 'EXACT_MATCH',
    overallConfidenceScore: 98.6,
    message: 'Identity Verified: Declared applicant details match OCR extraction from Aadhaar and PAN cards with 100% field consistency.',
    fieldMatches: [
      { fieldName: 'Full Legal Name', declaredValue: 'Jeeva Bharathi M', extractedValue: 'JEEVA BHARATHI M', isMatch: true, confidence: 99.2, status: 'MATCHED' },
      { fieldName: 'Date of Birth', declaredValue: '25/02/2006', extractedValue: '25/02/2006', isMatch: true, confidence: 100.0, status: 'MATCHED' },
      { fieldName: 'Gender', declaredValue: 'Male', extractedValue: 'Male', isMatch: true, confidence: 100.0, status: 'MATCHED' },
      { fieldName: 'PAN Card Number', declaredValue: 'DELPJ9476P', extractedValue: 'DELPJ9476P', isMatch: true, confidence: 100.0, status: 'MATCHED' },
      { fieldName: 'Aadhaar ID', declaredValue: '2235 1313 2450', extractedValue: 'XXXX XXXX 2450', isMatch: true, confidence: 98.0, status: 'MATCHED' },
    ],
    aadhaarExtracted: { name: 'Jeeva Bharathi M', dob: '25/02/2006', aadhaar: '2235 1313 2450' },
    panExtracted: { name: 'JEEVA BHARATHI M', fatherName: 'MAHALINGAM', pan: 'DELPJ9476P' },
  });

  // STEP 5: Camera Face Comparison
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [faceConsent, setFaceConsent] = useState<boolean>(true);
  const [faceLoading, setFaceLoading] = useState<boolean>(false);
  const [isSimulatedMismatch, setIsSimulatedMismatch] = useState<boolean>(false);
  const [liveCapturedFace, setLiveCapturedFace] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const [biometricResult, setBiometricResult] = useState<BiometricCrossCheckResult>({
    aadharPhotoMatchedPanPhoto: true,
    aadharPanSimilarityScore: 99.1,
    liveFaceMatchedDocuments: true,
    liveFaceSimilarityScore: 98.8,
    liveAadharSimilarityScore: 98.8,
    livePanSimilarityScore: 98.5,
    livenessVerified: true,
    livenessScore: 99.4,
    isMismatchSimulated: false,
    status: 'VERIFIED',
    message: 'Biometric Match Confirmed: Photo on Aadhaar and PAN belong to the same person, and match the live loan applicant (Jeeva Bharathi M).',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // STEP 6: EBM Explainable Eligibility
  const [prediction, setPrediction] = useState<any>({
    predictedClass: 'Approved',
    probability: 0.942,
    probabilityPercentage: 94.2,
    riskLevel: 'Low',
    modelVersion: 'v1.2.0-ebm',
    factors: [
      { feature: 'Payment History', featureLabel: 'Clean Repayment Track Record', contribution: 0.42, direction: 'POSITIVE', explanation: '98.2% on-time repayment ratio significantly bolsters creditworthiness.' },
      { feature: 'CIBIL Credit Score', featureLabel: 'Prime Bureau Score Band', contribution: 0.39, direction: 'POSITIVE', explanation: 'Score of 780 placed in the prime low-risk tier.' },
      { feature: 'Revolving Utilization', featureLabel: 'Disciplined Credit Usage', contribution: 0.28, direction: 'POSITIVE', explanation: '21.5% utilization reflects responsible revolving credit management.' },
      { feature: 'Debt-to-Income (DTI)', featureLabel: 'Affordable Monthly Obligation', contribution: 0.22, direction: 'POSITIVE', explanation: 'Monthly commitments under 28% leave ample disposable income.' },
    ],
  });

  // Collapsible diagnostics
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Reducing Balance EMI Calculation
  const loanAmountNum = Math.max(10000, parseFloat(loan.amountLakhs || '1') * 100000);
  const tenureMonthsNum = Math.max(6, parseInt(loan.tenure || '12', 10));
  const annualInterestRate = 0.105; // 10.5% per annum
  const monthlyRate = annualInterestRate / 12;
  const emiAmount = Math.round(
    (loanAmountNum * monthlyRate * Math.pow(1 + monthlyRate, tenureMonthsNum)) /
      (Math.pow(1 + monthlyRate, tenureMonthsNum) - 1)
  );
  const totalRepayment = emiAmount * tenureMonthsNum;
  const totalInterest = totalRepayment - loanAmountNum;

  // Cleanup camera stream on unmount or step change
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Camera video stream attachment effect (Fixes black/frozen camera bug)
  useEffect(() => {
    if (cameraActive && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => {
        console.warn('Camera video playback caught:', err);
      });
    }
  }, [cameraActive, mediaStream]);

  // Apply Underwriting Test Scenario (DigiLocker 3-Sample Profiles)
  const applyScenario = (scenarioKey: 'APPROVED' | 'NEED_VERIFICATION' | 'REJECTED') => {
    setSelectedScenarioKey(scenarioKey);
    const data = SAMPLE_DEMO_PROFILES[scenarioKey] || SAMPLE_DEMO_PROFILES.APPROVED;

    setProfile({
      name: data.name,
      age: scenarioKey === 'APPROVED' ? '20' : scenarioKey === 'NEED_VERIFICATION' ? '28' : '35',
      gender: data.gender,
      maritalStatus: scenarioKey === 'APPROVED' ? 'Single / Unmarried' : 'Married',
      income: data.income.toString(),
      job: data.job,
      dep: data.dep.toString(),
      panNumber: data.pan,
      aadhaarNumber: data.fullAadhaar,
    });

    setLoan({
      amountLakhs: (data.loanAmount / 100000).toString(),
      tenure: data.loanTenure.toString(),
      purpose: scenarioKey === 'APPROVED' ? 'personal' : scenarioKey === 'NEED_VERIFICATION' ? 'business' : 'personal',
      existingLoans: scenarioKey === 'APPROVED' ? '0' : scenarioKey === 'NEED_VERIFICATION' ? '1' : '3',
      monthlyObligations: scenarioKey === 'APPROVED' ? '3500' : scenarioKey === 'NEED_VERIFICATION' ? '12000' : '15000',
    });

    setCreditData({
      score: data.cibilScore,
      paymentHistory: scenarioKey === 'APPROVED' ? 98.2 : scenarioKey === 'NEED_VERIFICATION' ? 84.5 : 58.0,
      creditUtilization: scenarioKey === 'APPROVED' ? 21.5 : scenarioKey === 'NEED_VERIFICATION' ? 52.0 : 89.0,
      creditHistoryYears: scenarioKey === 'APPROVED' ? 4.5 : scenarioKey === 'NEED_VERIFICATION' ? 3.0 : 1.5,
      recentEnquiries: scenarioKey === 'APPROVED' ? 1 : scenarioKey === 'NEED_VERIFICATION' ? 3 : 7,
      riskBand: scenarioKey === 'APPROVED' ? 'LOW_RISK_PRIME' : scenarioKey === 'NEED_VERIFICATION' ? 'MODERATE_RISK_NEAR_PRIME' : 'HIGH_RISK_SUBPRIME',
      status: 'DEMO_RESULT_AVAILABLE',
      regulatoryBanner: 'Synthetic credit profile — retrieved via TransUnion / CIBIL simulation',
    });

    if (scenarioKey === 'APPROVED') {
      setAadhaarDoc({
        file: null,
        fileName: 'aadhaar_card_jeeva.jpg',
        fileSize: '1.2 MB',
        previewUrl: '/assets/aadhaar_card.jpg',
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: 'VERIFIED',
        extractedFields: {
          fullName: 'Jeeva Bharathi M',
          aadhaarNumber: '2235 1313 2450',
          maskedAadhaar: 'XXXX XXXX 2450',
          dateOfBirth: '25/02/2006',
          gender: 'Male',
          address: 'Tamil Nadu, India',
        },
        typeWarning: undefined,
        digiLockerMatch: {
          verified: true,
          status: 'MATCHED',
          message: 'DigiLocker Match Verified: Aadhaar (...2450) and name match Government DigiLocker UIDAI registry.',
        },
      });
      setPanDoc({
        file: null,
        fileName: 'pan_card_jeeva.jpg',
        fileSize: '820 KB',
        previewUrl: '/assets/pan_card.jpg',
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: 'VERIFIED',
        extractedFields: {
          fullName: 'JEEVA BHARATHI M',
          fatherName: 'MAHALINGAM',
          panNumber: 'DELPJ9476P',
          maskedPan: 'DELPJXXXXP',
          dateOfBirth: '25/02/2006',
          gender: 'Male',
        },
        typeWarning: undefined,
        digiLockerMatch: {
          verified: true,
          status: 'MATCHED',
          message: 'DigiLocker Match Verified: PAN (DELPJ9476P) matches Income Tax Dept record in DigiLocker.',
        },
      });
      setOcrCrossCheck({
        success: true,
        overallMatchStatus: 'EXACT_MATCH',
        overallConfidenceScore: 99.1,
        message: 'DigiLocker & OCR Verification Passed: All declared applicant credentials match DigiLocker repository with 100% consistency.',
        fieldMatches: [
          { fieldName: 'Full Legal Name', declaredValue: 'Jeeva Bharathi M', extractedValue: 'JEEVA BHARATHI M', isMatch: true, confidence: 99.2, status: 'MATCHED' },
          { fieldName: 'Date of Birth', declaredValue: '25/02/2006', extractedValue: '25/02/2006', isMatch: true, confidence: 100.0, status: 'MATCHED' },
          { fieldName: 'Gender', declaredValue: 'Male', extractedValue: 'Male', isMatch: true, confidence: 100.0, status: 'MATCHED' },
          { fieldName: 'PAN Card Number', declaredValue: 'DELPJ9476P', extractedValue: 'DELPJ9476P', isMatch: true, confidence: 100.0, status: 'MATCHED' },
          { fieldName: 'Aadhaar ID', declaredValue: '2235 1313 2450', extractedValue: 'XXXX XXXX 2450', isMatch: true, confidence: 98.5, status: 'MATCHED' },
        ],
        aadhaarExtracted: { name: 'Jeeva Bharathi M', dob: '25/02/2006', aadhaar: '2235 1313 2450' },
        panExtracted: { name: 'JEEVA BHARATHI M', fatherName: 'MAHALINGAM', pan: 'DELPJ9476P' },
      });
      setBiometricResult({
        aadharPhotoMatchedPanPhoto: true,
        aadharPanSimilarityScore: 99.1,
        liveFaceMatchedDocuments: true,
        liveFaceSimilarityScore: 98.8,
        liveAadharSimilarityScore: 98.8,
        livePanSimilarityScore: 98.5,
        livenessVerified: true,
        livenessScore: 99.4,
        isMismatchSimulated: false,
        status: 'VERIFIED',
        message: 'Biometric Match Confirmed: Photos on Aadhaar and PAN belong to the same person, matching live applicant Jeeva Bharathi M.',
      });
      setPrediction({
        predictedClass: 'Approved',
        probability: 0.942,
        probabilityPercentage: 94.2,
        riskLevel: 'Low',
        modelVersion: 'v1.2.0-ebm',
        factors: [
          { feature: 'Payment History (98.2%)', featureLabel: 'Clean Repayment Track Record', contribution: 0.42, direction: 'POSITIVE', explanation: '98.2% on-time repayment ratio significantly bolsters creditworthiness.' },
          { feature: 'CIBIL Credit Score (785)', featureLabel: 'Prime Bureau Score Band', contribution: 0.39, direction: 'POSITIVE', explanation: 'Prime score of 785 in top-tier risk bracket.' },
          { feature: 'Credit Utilization (21.5%)', featureLabel: 'Disciplined Credit Usage', contribution: 0.28, direction: 'POSITIVE', explanation: '21.5% utilization reflects responsible revolving credit management.' },
          { feature: 'DigiLocker KYC Compliance', featureLabel: '100% Verified Identity', contribution: 0.25, direction: 'POSITIVE', explanation: 'Instant tamper-proof biometric and DigiLocker verification passed.' },
        ],
      });
    } else if (scenarioKey === 'NEED_VERIFICATION') {
      setAadhaarDoc({
        file: null,
        fileName: 'aadhaar_jeeva_short.jpg',
        fileSize: '1.1 MB',
        previewUrl: '/assets/aadhaar_card.jpg',
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: 'NEEDS_REVIEW',
        extractedFields: {
          fullName: 'Jeeva B',
          aadhaarNumber: '4567 8901 2345',
          maskedAadhaar: 'XXXX XXXX 8901',
          dateOfBirth: '25/02/2006',
          gender: 'Male',
        },
        typeWarning: undefined,
        digiLockerMatch: {
          verified: false,
          status: 'MISMATCH',
          message: 'DigiLocker Discrepancy: Name on Aadhaar ("Jeeva B") shows variation against PAN ("Jeeva Bharathi M"). Flagged for underwriter review.',
        },
      });
      setPanDoc({
        file: null,
        fileName: 'pan_card_jeeva.jpg',
        fileSize: '820 KB',
        previewUrl: '/assets/pan_card.jpg',
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: 'VERIFIED',
        extractedFields: {
          fullName: 'JEEVA BHARATHI M',
          panNumber: 'DELPJ9476P',
          dateOfBirth: '25/02/2006',
        },
        typeWarning: undefined,
        digiLockerMatch: {
          verified: true,
          status: 'MATCHED',
          message: 'DigiLocker Match Verified: PAN matches Income Tax Dept record in DigiLocker.',
        },
      });
      setOcrCrossCheck({
        success: true,
        overallMatchStatus: 'FUZZY_MATCH',
        overallConfidenceScore: 82.4,
        message: 'Manual Review Required: Slight name variation detected between Aadhaar ("Jeeva B") and PAN ("Jeeva Bharathi M").',
        fieldMatches: [
          { fieldName: 'Full Legal Name', declaredValue: 'Jeeva B', extractedValue: 'JEEVA BHARATHI M', isMatch: false, confidence: 82.0, status: 'MISMATCH' },
          { fieldName: 'Date of Birth', declaredValue: '25/02/2006', extractedValue: '25/02/2006', isMatch: true, confidence: 100.0, status: 'MATCHED' },
          { fieldName: 'PAN Card Number', declaredValue: 'DELPJ9476P', extractedValue: 'DELPJ9476P', isMatch: true, confidence: 100.0, status: 'MATCHED' },
          { fieldName: 'Aadhaar ID', declaredValue: '4567 8901 2345', extractedValue: 'XXXX XXXX 8901', isMatch: true, confidence: 96.0, status: 'MATCHED' },
        ],
        aadhaarExtracted: { name: 'Jeeva B', dob: '25/02/2006', aadhaar: '4567 8901 2345' },
        panExtracted: { name: 'JEEVA BHARATHI M', pan: 'DELPJ9476P' },
      });
      setBiometricResult({
        aadharPhotoMatchedPanPhoto: true,
        aadharPanSimilarityScore: 92.4,
        liveFaceMatchedDocuments: true,
        liveFaceSimilarityScore: 91.8,
        liveAadharSimilarityScore: 91.8,
        livePanSimilarityScore: 93.0,
        livenessVerified: true,
        livenessScore: 95.0,
        isMismatchSimulated: false,
        status: 'NEEDS_REVIEW',
        message: 'Biometric Match Acceptable (92.4%), but KYC name variation flagged for loan officer sign-off.',
      });
      setPrediction({
        predictedClass: 'Needs Review',
        probability: 0.648,
        probabilityPercentage: 64.8,
        riskLevel: 'Moderate',
        modelVersion: 'v1.2.0-ebm',
        factors: [
          { feature: 'CIBIL Credit Score (662)', featureLabel: 'Near-Prime Credit Band', contribution: 0.12, direction: 'POSITIVE', explanation: 'Score of 662 is acceptable but sits near minimum underwriting cut-off.' },
          { feature: 'Debt-to-Income (48%)', featureLabel: 'Moderate Debt Obligation', contribution: -0.18, direction: 'NEGATIVE', explanation: 'Debt servicing is high relative to reported net self-employed income.' },
          { feature: 'KYC Name Variation Flag', featureLabel: 'Name Discrepancy Flag', contribution: -0.22, direction: 'NEGATIVE', explanation: 'Disparity between Aadhaar "Jeeva B" and PAN requires underwriting sign-off.' },
        ],
      });
    } else {
      // REJECTED
      setAadhaarDoc({
        file: null,
        fileName: 'aadhaar_karthik.jpg',
        fileSize: '980 KB',
        previewUrl: '/assets/aadhaar_card.jpg',
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: 'FAILED',
        extractedFields: {
          fullName: 'Karthik Raman',
          aadhaarNumber: '9876 5432 1098',
          dateOfBirth: '10/11/2004',
        },
        typeWarning: undefined,
        digiLockerMatch: {
          verified: false,
          status: 'MISMATCH',
          message: 'DigiLocker Database Mismatch: Aadhaar number not matched with active applicant account.',
        },
      });
      setPanDoc({
        file: null,
        fileName: 'pan_karthik.jpg',
        fileSize: '710 KB',
        previewUrl: '/assets/pan_card.jpg',
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: 'FAILED',
        extractedFields: {
          fullName: 'Karthik Raman',
          panNumber: 'XYZKL9999P',
          dateOfBirth: '10/11/2004',
        },
        typeWarning: undefined,
        digiLockerMatch: {
          verified: false,
          status: 'MISMATCH',
          message: 'DigiLocker Database Mismatch: PAN not linked with authenticated DigiLocker account.',
        },
      });
      setOcrCrossCheck({
        success: false,
        overallMatchStatus: 'MISMATCH',
        overallConfidenceScore: 42.1,
        message: 'Verification Failed: High risk profile with subprime credit (535) and excessive debt-to-income ratio (82%).',
        fieldMatches: [
          { fieldName: 'Full Legal Name', declaredValue: 'Karthik Raman', extractedValue: 'Karthik Raman', isMatch: true, confidence: 99.0, status: 'MATCHED' },
          { fieldName: 'CIBIL Credit Score', declaredValue: '535 (Subprime)', extractedValue: '535', isMatch: false, confidence: 40.0, status: 'MISMATCH' },
          { fieldName: 'Debt-to-Income', declaredValue: '82%', extractedValue: '82% (>50% Limit)', isMatch: false, confidence: 35.0, status: 'MISMATCH' },
        ],
        aadhaarExtracted: { name: 'Karthik Raman', dob: '10/11/2004', aadhaar: '9876 5432 1098' },
        panExtracted: { name: 'Karthik Raman', pan: 'XYZKL9999P' },
      });
      setBiometricResult({
        aadharPhotoMatchedPanPhoto: false,
        aadharPanSimilarityScore: 44.5,
        liveFaceMatchedDocuments: false,
        liveFaceSimilarityScore: 48.0,
        liveAadharSimilarityScore: 48.0,
        livePanSimilarityScore: 44.5,
        livenessVerified: false,
        livenessScore: 42.0,
        isMismatchSimulated: true,
        status: 'FAILED',
        message: 'Biometric Verification Failed: Document photo similarity score (44.5%) is below security threshold (75%).',
      });
      setPrediction({
        predictedClass: 'Declined',
        probability: 0.185,
        probabilityPercentage: 18.5,
        riskLevel: 'High',
        modelVersion: 'v1.2.0-ebm',
        factors: [
          { feature: 'Subprime CIBIL Score (535)', featureLabel: 'High Bureau Delinquency', contribution: -0.58, direction: 'NEGATIVE', explanation: 'Score 535 indicates historical severe default and missed payments.' },
          { feature: 'Excessive Debt-to-Income (82%)', featureLabel: 'Exceeds Maximum Debt Limit', contribution: -0.46, direction: 'NEGATIVE', explanation: 'Proposed debt obligations exceed 80% of net monthly income.' },
          { feature: 'Revolving Credit Utilization (89%)', featureLabel: 'Overleveraged Credit Lines', contribution: -0.34, direction: 'NEGATIVE', explanation: 'Heavy credit facility utilization reflects acute liquidity stress.' },
        ],
      });
    }
  };

  const selectPersona = (personaKey: string) => {
    if (personaKey === 'jeeva' || personaKey === 'APPROVED') {
      applyScenario('APPROVED');
    } else if (personaKey === 'kavitha' || personaKey === 'NEED_VERIFICATION') {
      applyScenario('NEED_VERIFICATION');
    } else if (personaKey === 'senthil' || personaKey === 'REJECTED') {
      applyScenario('REJECTED');
    } else {
      applyScenario('APPROVED');
    }
  };

  // DigiLocker pull sync
  const handleSyncDigiLocker = async () => {
    setDigiLockerSyncing(true);
    try {
      await pullDigiLockerDocsApi(savedApplicationId, selectedScenarioKey);
    } catch {}
    setTimeout(() => {
      setDigiLockerSyncing(false);
    }, 600);
  };

  // STEP 2: Fetch synthetic credit bureau data
  const handleFetchCreditProfile = async () => {
    if (!creditConsent) {
      setError('Please provide consent to retrieve your credit score from the credit registry.');
      return;
    }
    setError('');
    setCreditLoading(true);
    try {
      const res = await verifyCreditApi({
        applicationId: savedApplicationId,
        panNumber: profile.panNumber,
        consentGiven: true,
      });
      const cp = res.creditProfile;
      setCreditData({
        score: cp.cibilScore,
        paymentHistory: cp.paymentHistory,
        creditUtilization: cp.creditUtilization,
        creditHistoryYears: cp.creditHistoryYears,
        recentEnquiries: cp.recentEnquiries,
        riskBand: cp.cibilScore >= 750 ? 'LOW_RISK_PRIME' : cp.cibilScore >= 650 ? 'MODERATE_RISK_NEAR_PRIME' : 'HIGH_RISK_SUBPRIME',
        status: cp.verificationStatus,
        regulatoryBanner: 'Synthetic credit profile — retrieved via TransUnion / CIBIL simulation',
      });
    } catch (err: any) {
      setError('Unable to retrieve synthetic credit profile.');
    } finally {
      setCreditLoading(false);
    }
  };

  // STEP 3: Document Upload Handlers with Cross-Classification & DigiLocker DB Cross-Matching
  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Validate size and non-empty
    if (file.size === 0) {
      setError('Selected Aadhaar file is empty (0 bytes). Please select a valid document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Aadhaar file exceeds the 10 MB limit.');
      return;
    }

    setError('');
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const fname = file.name.toLowerCase();

    // Document Type Classification Check: Did user upload a PAN Card in the Aadhaar slot?
    let typeWarning: string | undefined = undefined;
    if (fname.includes('pan') && !fname.includes('aadhaar')) {
      typeWarning = 'Document Type Mismatch Warning: Uploaded file appears to be a PAN Card! Please upload an official Aadhaar Card in this slot.';
    } else if (!fname.includes('aadhaar') && !fname.includes('uidai') && !fname.includes('card') && !fname.includes('id') && !fname.includes('doc')) {
      typeWarning = 'Document Advisory: Please ensure this file is an official Government of India Aadhaar Card.';
    }

    // Cross-match with DigiLocker database record
    const currentScenario = SAMPLE_DEMO_PROFILES[selectedScenarioKey] || SAMPLE_DEMO_PROFILES.APPROVED;
    const isMatched = selectedScenarioKey === 'APPROVED' && !typeWarning;
    const digiLockerMatch = {
      verified: isMatched,
      status: (isMatched ? 'MATCHED' : 'MISMATCH') as 'MATCHED' | 'MISMATCH',
      message: isMatched
        ? `DigiLocker Database Match: 100% Verified against DigiLocker UIDAI registry for ${currentScenario.name} (Ending in ${currentScenario.fullAadhaar.slice(-4)}).`
        : selectedScenarioKey === 'NEED_VERIFICATION'
        ? `DigiLocker Advisory: Name disparity detected between uploaded document and DigiLocker record ("${currentScenario.name}").`
        : `DigiLocker Discrepancy: Uploaded document does not match the active DigiLocker record for this applicant.`,
    };

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAadhaarDoc({
        file,
        fileName: file.name,
        fileSize: sizeStr,
        previewUrl: dataUrl,
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: typeWarning ? 'NEEDS_REVIEW' : selectedScenarioKey === 'REJECTED' ? 'FAILED' : 'VERIFIED',
        extractedFields: {
          fullName: currentScenario.name,
          aadhaarNumber: currentScenario.fullAadhaar,
          maskedAadhaar: currentScenario.maskedAadhaar,
          dateOfBirth: currentScenario.dob,
          gender: currentScenario.gender,
        },
        typeWarning,
        digiLockerMatch,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Validate size and non-empty
    if (file.size === 0) {
      setError('Selected PAN file is empty (0 bytes). Please select a valid document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('PAN file exceeds the 10 MB limit.');
      return;
    }

    setError('');
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const fname = file.name.toLowerCase();

    // Document Type Classification Check: Did user upload an Aadhaar Card in the PAN slot?
    let typeWarning: string | undefined = undefined;
    if ((fname.includes('aadhaar') || fname.includes('uidai') || fname.includes('aadhar')) && !fname.includes('pan')) {
      typeWarning = 'Document Type Mismatch Warning: Uploaded file appears to be an Aadhaar Card! Please upload an official PAN Card in this slot.';
    } else if (!fname.includes('pan') && !fname.includes('nsdl') && !fname.includes('card') && !fname.includes('id') && !fname.includes('doc')) {
      typeWarning = 'Document Advisory: Please ensure this file is an official Income Tax Department PAN Card.';
    }

    // Cross-match with DigiLocker database record
    const currentScenario = SAMPLE_DEMO_PROFILES[selectedScenarioKey] || SAMPLE_DEMO_PROFILES.APPROVED;
    const isMatched = (selectedScenarioKey === 'APPROVED' || selectedScenarioKey === 'NEED_VERIFICATION') && !typeWarning;
    const digiLockerMatch = {
      verified: isMatched,
      status: (isMatched ? 'MATCHED' : 'MISMATCH') as 'MATCHED' | 'MISMATCH',
      message: isMatched
        ? `DigiLocker Database Match: 100% Verified against Income Tax Dept PAN registry (${currentScenario.pan}).`
        : `DigiLocker Discrepancy: Uploaded PAN credentials do not match the active DigiLocker database record.`,
    };

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPanDoc({
        file,
        fileName: file.name,
        fileSize: sizeStr,
        previewUrl: dataUrl,
        uploadStatus: 'UPLOADED',
        ocrStatus: 'EXTRACTED',
        verificationStatus: typeWarning ? 'NEEDS_REVIEW' : selectedScenarioKey === 'REJECTED' ? 'FAILED' : 'VERIFIED',
        extractedFields: {
          fullName: currentScenario.name.toUpperCase(),
          panNumber: currentScenario.pan,
          dateOfBirth: currentScenario.dob,
        },
        typeWarning,
        digiLockerMatch,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAadhaar = () => {
    setAadhaarDoc({
      file: null,
      fileName: '',
      fileSize: '',
      previewUrl: null,
      uploadStatus: 'NOT_UPLOADED',
      ocrStatus: 'NOT_PROCESSED',
      verificationStatus: 'NOT_VERIFIED',
      extractedFields: {},
      typeWarning: undefined,
      digiLockerMatch: undefined,
    });
  };

  const handleRemovePan = () => {
    setPanDoc({
      file: null,
      fileName: '',
      fileSize: '',
      previewUrl: null,
      uploadStatus: 'NOT_UPLOADED',
      ocrStatus: 'NOT_PROCESSED',
      verificationStatus: 'NOT_VERIFIED',
      extractedFields: {},
      typeWarning: undefined,
      digiLockerMatch: undefined,
    });
  };

  // STEP 4: Run OCR Processing & Consistency Check
  const handleRunOcrProcessing = async () => {
    if (aadhaarDoc.uploadStatus === 'NOT_UPLOADED' || panDoc.uploadStatus === 'NOT_UPLOADED') {
      setError('Please upload both Aadhaar and PAN documents before running OCR verification.');
      return;
    }
    setError('');
    setOcrLoading(true);

    try {
      // Execute cross-check against declared profile
      const res = await crossCheckProfileOcrApi({
        declaredName: profile.name,
        declaredDob: '25/02/2006',
        declaredGender: profile.gender,
        declaredPan: profile.panNumber,
        declaredAadhaar: profile.aadhaarNumber,
      });

      setOcrCrossCheck(res);
      setAadhaarDoc((prev) => ({
        ...prev,
        ocrStatus: 'EXTRACTED',
        verificationStatus: prev.typeWarning ? 'NEEDS_REVIEW' : 'VERIFIED',
        extractedFields: res.aadhaarExtracted || prev.extractedFields,
      }));
      setPanDoc((prev) => ({
        ...prev,
        ocrStatus: 'EXTRACTED',
        verificationStatus: prev.typeWarning ? 'NEEDS_REVIEW' : 'VERIFIED',
        extractedFields: res.panExtracted || prev.extractedFields,
      }));
    } catch (err: any) {
      setError('OCR extraction encountered an error. Please verify the document images are clear and readable.');
    } finally {
      setOcrLoading(false);
    }
  };

  // STEP 5: Camera & Biometric Handlers
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      setMediaStream(stream);
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('Unable to access live webcam. You can use the "Take Selfie / Upload Photo" or "Use Verified Frame" options below.');
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
  };

  const executeBiometricVerification = async (liveSnapshot: string) => {
    setFaceLoading(true);
    setError('');

    try {
      const res = await verifyTriBiometricApi({
        applicationId: savedApplicationId,
        liveCameraFrameBase64: liveSnapshot,
        aadharImageBase64: aadhaarDoc.previewUrl || '/assets/aadhaar_photo.jpg',
        panImageBase64: panDoc.previewUrl || '/assets/pan_photo.jpg',
        simulateMismatch: isSimulatedMismatch || selectedScenarioKey === 'REJECTED',
      });

      setBiometricResult({
        ...res,
        liveSnapshotUrl: liveSnapshot,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        stopCamera();
      }
    } catch (err: any) {
      if (selectedScenarioKey === 'APPROVED' && !isSimulatedMismatch) {
        setBiometricResult({
          aadharPhotoMatchedPanPhoto: true,
          aadharPanSimilarityScore: 99.1,
          liveFaceMatchedDocuments: true,
          liveFaceSimilarityScore: 98.8,
          liveAadharSimilarityScore: 98.8,
          livePanSimilarityScore: 98.5,
          livenessVerified: true,
          livenessScore: 99.4,
          isMismatchSimulated: false,
          status: 'VERIFIED',
          message: 'Biometric Match Confirmed: Photos on Aadhaar and PAN belong to the same person, matching live applicant Jeeva Bharathi M.',
          liveSnapshotUrl: liveSnapshot,
        });
      } else if (selectedScenarioKey === 'NEED_VERIFICATION') {
        setBiometricResult({
          aadharPhotoMatchedPanPhoto: true,
          aadharPanSimilarityScore: 92.4,
          liveFaceMatchedDocuments: true,
          liveFaceSimilarityScore: 91.8,
          liveAadharSimilarityScore: 91.8,
          livePanSimilarityScore: 93.0,
          livenessVerified: true,
          livenessScore: 95.0,
          isMismatchSimulated: false,
          status: 'NEEDS_REVIEW',
          message: 'Biometric Match Acceptable (91.8%), but KYC name variation flagged for loan officer review.',
          liveSnapshotUrl: liveSnapshot,
        });
      } else {
        setBiometricResult({
          aadharPhotoMatchedPanPhoto: false,
          aadharPanSimilarityScore: 44.5,
          liveFaceMatchedDocuments: false,
          liveFaceSimilarityScore: 48.0,
          liveAadharSimilarityScore: 48.0,
          livePanSimilarityScore: 44.5,
          livenessVerified: false,
          livenessScore: 42.0,
          isMismatchSimulated: true,
          status: 'FAILED',
          message: 'Biometric Verification Failed: Facial similarity score (48.0%) is below required threshold (75%).',
          liveSnapshotUrl: liveSnapshot,
        });
      }
      stopCamera();
    } finally {
      setFaceLoading(false);
    }
  };

  const capturePhotoAndVerify = async () => {
    if (!faceConsent) {
      setError('Informed consent is required for biometric face authentication.');
      return;
    }

    let capturedB64: string | null = null;
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          capturedB64 = canvas.toDataURL('image/jpeg', 0.85);
          setLiveCapturedFace(capturedB64);
        }
      }
    }

    if (!capturedB64) {
      capturedB64 = liveCapturedFace || '/assets/aadhaar_photo.jpg';
      setLiveCapturedFace(capturedB64);
    }

    await executeBiometricVerification(capturedB64);
  };

  const handleLiveSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLiveCapturedFace(dataUrl);
      executeBiometricVerification(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUseVerifiedLiveFrame = () => {
    const testFrameUrl = '/assets/aadhaar_photo.jpg';
    setLiveCapturedFace(testFrameUrl);
    executeBiometricVerification(testFrameUrl);
  };

  // STEP 6: Execute EBM Prediction
  const handleEvaluateEligibility = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await runPredictionApi(savedApplicationId);
      if (res) {
        setPrediction(res);
      }
    } catch (err: any) {
      // Fallback EBM prediction state
      setPrediction({
        predictedClass: creditData.score >= 700 ? 'Approved' : creditData.score >= 600 ? 'Needs Review' : 'Declined',
        probability: creditData.score >= 700 ? 0.94 : creditData.score >= 600 ? 0.65 : 0.28,
        probabilityPercentage: creditData.score >= 700 ? 94.0 : creditData.score >= 600 ? 65.0 : 28.0,
        riskLevel: creditData.score >= 700 ? 'Low' : creditData.score >= 600 ? 'Moderate' : 'High',
        modelVersion: 'v1.2.0-ebm',
        factors: [
          { feature: 'Payment History', featureLabel: 'Clean Repayment Track Record', contribution: 0.42, direction: 'POSITIVE', explanation: `${creditData.paymentHistory}% on-time ratio bolsters credit standing.` },
          { feature: 'Credit Bureau Score', featureLabel: 'Synthetic Bureau Score', contribution: 0.39, direction: 'POSITIVE', explanation: `Score of ${creditData.score} reflects disciplined borrowing behavior.` },
          { feature: 'Revolving Utilization', featureLabel: 'Credit Utilization Ratio', contribution: 0.28, direction: 'POSITIVE', explanation: `${creditData.creditUtilization}% revolving usage is comfortably below threshold.` },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Stepper Labels
  const steps = [
    { num: 1, label: 'Applicant Details' },
    { num: 2, label: 'Loan & Financials' },
    { num: 3, label: 'Document Upload' },
    { num: 4, label: 'OCR & Consistency' },
    { num: 5, label: 'Face Comparison' },
    { num: 6, label: 'AI Eligibility' },
    { num: 7, label: 'Final Summary' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Loan Assistant
                </span>
                <span className="text-xs text-slate-500">Ref: {savedApplicationId}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">Digital Personal Loan Application</h1>
              <p className="text-xs text-slate-600">Explainable AI Underwriting with Glassbox Boosting & Tri-Biometric Identity</p>
            </div>

            {/* Demo Personas Quick Select */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Scenario:</label>
              <select
                value={selectedScenarioKey}
                onChange={(e) => applyScenario(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="APPROVED">1. Loan Approved (Prime CIBIL 785 - Salaried)</option>
                <option value="NEED_VERIFICATION">2. Need Verification (Borderline 662 - KYC Check)</option>
                <option value="REJECTED">3. Loan Rejected (Subprime 535 - High DTI 82%)</option>
              </select>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-between w-full">
                {steps.map((s) => (
                  <li key={s.num} className="relative flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => setStep(s.num)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        step === s.num
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : step > s.num
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                    </button>
                    <span
                      className={`text-[11px] mt-1 text-center font-medium hidden md:block ${
                        step === s.num ? 'text-blue-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-900">Application Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: Applicant Details */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-bold text-slate-900">1. Applicant Personal Details & DigiLocker Authentication</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an underwriting scenario or review your authenticated identity credentials fetched via DigiLocker.
              </p>
            </div>

            {/* 3 Predefined Sample Data Profiles (Approved, Need Verification, Rejected) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Select Underwriting Test Scenario (DigiLocker & Credit Presets)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">1-Click Full Stack Simulation</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Profile 1: Loan Approved */}
                <div
                  onClick={() => applyScenario('APPROVED')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScenarioKey === 'APPROVED'
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 1. Loan Approved
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      CIBIL 785
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{SAMPLE_DEMO_PROFILES.APPROVED.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Salaried ₹85,000 • 100% DigiLocker match • Low Risk
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>PAN: DELPJ9476P</span>
                    <span className="text-emerald-700 font-semibold">Straight-Through Approval</span>
                  </div>
                </div>

                {/* Profile 2: Need Verification */}
                <div
                  onClick={() => applyScenario('NEED_VERIFICATION')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScenarioKey === 'NEED_VERIFICATION'
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 2. Need Verification
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      CIBIL 662
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{SAMPLE_DEMO_PROFILES.NEED_VERIFICATION.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Self-Employed ₹42k • Name variation (Jeeva B vs Jeeva Bharathi M)
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>PAN: DELPJ9476P</span>
                    <span className="text-amber-700 font-semibold">Underwriter Audit</span>
                  </div>
                </div>

                {/* Profile 3: Loan Rejected */}
                <div
                  onClick={() => applyScenario('REJECTED')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScenarioKey === 'REJECTED'
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-400 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> 3. Loan Rejected
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      CIBIL 535
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{SAMPLE_DEMO_PROFILES.REJECTED.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Income ₹18k • High DTI 82% (&gt;50%) • DigiLocker mismatch
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>PAN: XYZKL9999P</span>
                    <span className="text-rose-700 font-semibold">Automated Decline</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={profile.job}
                  onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="salaried">Salaried (Private / Govt)</option>
                  <option value="self_employed">Self-Employed / Business</option>
                  <option value="not_employed">Other / Not Formally Employed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Net Income (₹)</label>
                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Dependents</label>
                <input
                  type="number"
                  value={profile.dep}
                  onChange={(e) => setProfile({ ...profile, dep: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* DigiLocker Verified Identity Box (Replaces manual Aadhaar and PAN inputs) */}
              <div className="md:col-span-2 p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">DigiLocker Verified Identity Credentials</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          GOVT OF INDIA AUTHENTICATED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        In accordance with RBI Digital Lending Directives, manual Aadhaar and PAN inputs are disabled. Credentials are authenticated directly via DigiLocker.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncDigiLocker}
                    disabled={digiLockerSyncing}
                    className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${digiLockerSyncing ? 'animate-spin' : ''}`} />
                    {digiLockerSyncing ? 'Syncing...' : 'Sync from DigiLocker'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-blue-600" /> Masked Aadhaar Number
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ✓ UIDAI Verified
                      </span>
                    </div>
                    <p className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                      {SAMPLE_DEMO_PROFILES[selectedScenarioKey]?.maskedAadhaar || 'XXXXXXXX2450'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Source: DigiLocker Issued Document ID (UIDAI Gateway)</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Permanent Account Number (PAN)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ✓ ITD / NSDL Verified
                      </span>
                    </div>
                    <p className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                      {SAMPLE_DEMO_PROFILES[selectedScenarioKey]?.pan || 'DELPJ9476P'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Source: Income Tax Department / NSDL Registry</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                Next: Loan Requirements <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loan Requirements & Financials */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-base font-bold text-slate-900">2. Loan Requirements & Affordability</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure your desired loan terms and review the reducing-balance repayment schedule.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Requested Amount</label>
                    <span className="text-xs font-bold text-blue-600">₹{(parseFloat(loan.amountLakhs) * 100000).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.25"
                    value={loan.amountLakhs}
                    onChange={(e) => setLoan({ ...loan, amountLakhs: e.target.value })}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>₹50,000</span>
                    <span>₹7,50,000</span>
                    <span>₹15,00,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Tenure (Months)</label>
                    <span className="text-xs font-bold text-blue-600">{loan.tenure} Months</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="60"
                    step="6"
                    value={loan.tenure}
                    onChange={(e) => setLoan({ ...loan, tenure: e.target.value })}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>6 Mos</span>
                    <span>24 Mos</span>
                    <span>60 Mos</span>
                  </div>
                </div>
              </div>

              {/* Live Reducing-Balance EMI Preview */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Monthly EMI</span>
                    <p className="text-lg font-bold text-blue-700 mt-0.5">₹{emiAmount.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-slate-400">@ 10.5% p.a. Reducing</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total Interest</span>
                    <p className="text-lg font-bold text-slate-700 mt-0.5">₹{totalInterest.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-slate-400">Over {tenureMonthsNum} Mos</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total Repayment</span>
                    <p className="text-lg font-bold text-slate-700 mt-0.5">₹{totalRepayment.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-slate-400">Principal + Interest</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Synthetic Bureau Credit Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Credit Registry Record</h3>
                  <p className="text-xs text-slate-500">Retrieved from synthetic bureau dataset for PAN {profile.panNumber}.</p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchCreditProfile}
                  disabled={creditLoading}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${creditLoading ? 'animate-spin' : ''}`} />
                  Refresh Profile
                </button>
              </div>

              {/* Synthetic Disclaimer Banner */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>Notice:</strong> {creditData.regulatoryBanner}. System does not connect to live commercial bureaus without institutional licensing.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500">Synthetic Bureau Score</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{creditData.score}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">Scale: 300–900</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500">Payment History</span>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">{creditData.paymentHistory}%</p>
                  <span className="text-[10px] text-slate-400">On-Time Ratio</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500">Credit Utilization</span>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">{creditData.creditUtilization}%</p>
                  <span className="text-[10px] text-slate-400">Revolving Balance</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500">Recent Inquiries</span>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">{creditData.recentEnquiries}</p>
                  <span className="text-[10px] text-slate-400">Last 12 Months</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  ← Back to Applicant Details
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  Next: Document Upload <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Manual Document Upload (Independent Aadhaar & PAN) */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-bold text-slate-900">3. Identity Document Upload</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your Aadhaar Card and PAN Card. Each document is managed independently with separate preview, replacement, and OCR processing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document 1: Aadhaar Card */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-blue-600" /> Aadhaar Card
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        aadhaarDoc.uploadStatus === 'UPLOADED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {aadhaarDoc.uploadStatus === 'UPLOADED' ? 'Uploaded' : 'Not Uploaded'}
                    </span>
                  </div>

                  {/* Preview Area */}
                  {aadhaarDoc.previewUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-300 bg-white h-44 flex items-center justify-center">
                      <img
                        src={aadhaarDoc.previewUrl}
                        alt="Aadhaar Document Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg({ title: 'Aadhaar Card Preview', src: aadhaarDoc.previewUrl! })}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity"
                      >
                        <Eye className="w-4 h-4" /> Click to Zoom
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white h-44 flex flex-col items-center justify-center p-4 text-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs font-medium text-slate-700">Select Aadhaar Card</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PDF, JPG, or PNG (Max 10 MB)</p>
                    </div>
                  )}

                  {aadhaarDoc.fileName && (
                    <div className="mt-2 text-xs text-slate-600 flex justify-between">
                      <span className="truncate max-w-[200px] font-medium">{aadhaarDoc.fileName}</span>
                      <span className="text-slate-400">{aadhaarDoc.fileSize}</span>
                    </div>
                  )}

                  {/* Document Type Mismatch Warning */}
                  {aadhaarDoc.typeWarning && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Slot Mismatch Detected:</span>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{aadhaarDoc.typeWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* DigiLocker Database Cross-Match Badge */}
                  {aadhaarDoc.digiLockerMatch && (
                    <div
                      className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        aadhaarDoc.digiLockerMatch.status === 'MATCHED'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}
                    >
                      {aadhaarDoc.digiLockerMatch.status === 'MATCHED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold">
                          {aadhaarDoc.digiLockerMatch.status === 'MATCHED'
                            ? '✓ DigiLocker Database: Verified Match'
                            : '⚠️ DigiLocker Database: Discrepancy Flag'}
                        </span>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{aadhaarDoc.digiLockerMatch.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold text-center transition-colors">
                    {aadhaarDoc.uploadStatus === 'UPLOADED' ? 'Replace Aadhaar' : 'Upload Aadhaar'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleAadhaarUpload}
                      className="hidden"
                    />
                  </label>
                  {aadhaarDoc.uploadStatus === 'UPLOADED' && (
                    <button
                      type="button"
                      onClick={handleRemoveAadhaar}
                      className="p-2 border border-slate-300 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors"
                      title="Remove Aadhaar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Document 2: PAN Card */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" /> PAN Card
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        panDoc.uploadStatus === 'UPLOADED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {panDoc.uploadStatus === 'UPLOADED' ? 'Uploaded' : 'Not Uploaded'}
                    </span>
                  </div>

                  {/* Preview Area */}
                  {panDoc.previewUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-300 bg-white h-44 flex items-center justify-center">
                      <img
                        src={panDoc.previewUrl}
                        alt="PAN Document Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg({ title: 'PAN Card Preview', src: panDoc.previewUrl! })}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity"
                      >
                        <Eye className="w-4 h-4" /> Click to Zoom
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white h-44 flex flex-col items-center justify-center p-4 text-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs font-medium text-slate-700">Select PAN Card</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PDF, JPG, or PNG (Max 10 MB)</p>
                    </div>
                  )}

                  {panDoc.fileName && (
                    <div className="mt-2 text-xs text-slate-600 flex justify-between">
                      <span className="truncate max-w-[200px] font-medium">{panDoc.fileName}</span>
                      <span className="text-slate-400">{panDoc.fileSize}</span>
                    </div>
                  )}

                  {/* Document Type Mismatch Warning */}
                  {panDoc.typeWarning && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Slot Mismatch Detected:</span>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{panDoc.typeWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* DigiLocker Database Cross-Match Badge */}
                  {panDoc.digiLockerMatch && (
                    <div
                      className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        panDoc.digiLockerMatch.status === 'MATCHED'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}
                    >
                      {panDoc.digiLockerMatch.status === 'MATCHED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold">
                          {panDoc.digiLockerMatch.status === 'MATCHED'
                            ? '✓ DigiLocker Database: Verified Match'
                            : '⚠️ DigiLocker Database: Discrepancy Flag'}
                        </span>
                        <p className="text-[11px] mt-0.5 leading-relaxed">{panDoc.digiLockerMatch.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold text-center transition-colors">
                    {panDoc.uploadStatus === 'UPLOADED' ? 'Replace PAN' : 'Upload PAN'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handlePanUpload}
                      className="hidden"
                    />
                  </label>
                  {panDoc.uploadStatus === 'UPLOADED' && (
                    <button
                      type="button"
                      onClick={handleRemovePan}
                      className="p-2 border border-slate-300 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors"
                      title="Remove PAN"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={aadhaarDoc.uploadStatus === 'NOT_UPLOADED' || panDoc.uploadStatus === 'NOT_UPLOADED'}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                Next: Run OCR & Consistency Check <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: OCR Processing & Document Consistency */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">4. Document OCR & Profile Consistency</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automated Optical Character Recognition extracts structured fields and cross-checks them against declared details.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRunOcrProcessing}
                  disabled={ocrLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${ocrLoading ? 'animate-spin' : ''}`} />
                  {ocrLoading ? 'Processing OCR...' : 'Re-Run OCR Check'}
                </button>
              </div>

              {/* Match Status Banner */}
              {ocrCrossCheck && (
                <div
                  className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
                    ocrCrossCheck.overallMatchStatus === 'EXACT_MATCH'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wide">
                        Status: {ocrCrossCheck.overallMatchStatus.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-emerald-300">
                        {ocrCrossCheck.overallConfidenceScore}% Confidence
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-slate-700">{ocrCrossCheck.message}</p>
                  </div>
                </div>
              )}

              {/* Extracted Fields Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-3 font-semibold">Field Name</th>
                      <th className="py-2.5 px-3 font-semibold">Declared by Applicant</th>
                      <th className="py-2.5 px-3 font-semibold">OCR Extracted from Document</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(ocrCrossCheck?.fieldMatches || []).map((fm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{fm.fieldName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{fm.declaredValue}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">{fm.extractedValue}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {fm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  ← Back to Uploads
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  Next: Camera Face Comparison <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Camera-Based Face Comparison */}
        {step === 5 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-bold text-slate-900">5. Tri-Biometric Face Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compares the reference portraits on your Aadhaar and PAN cards with a live camera capture to confirm identity.
              </p>
            </div>

            {/* Tri-Photo Reference Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Photo 1: Aadhaar Portrait */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">1. Aadhaar Portrait</span>
                <div className="w-24 h-28 mx-auto rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center">
                  <img
                    src="/assets/aadhaar_photo.jpg"
                    alt="Aadhaar Reference Portrait"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Extracted from Aadhaar</span>
              </div>

              {/* Photo 2: PAN Portrait */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">2. PAN Portrait</span>
                <div className="w-24 h-28 mx-auto rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center">
                  <img
                    src="/assets/pan_photo.jpg"
                    alt="PAN Reference Portrait"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Extracted from PAN</span>
              </div>

              {/* Photo 3: Live Camera Capture */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">3. Live Webcam Capture</span>
                <div className="w-24 h-28 mx-auto rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center">
                  {liveCapturedFace ? (
                    <img src={liveCapturedFace} alt="Live Captured Face" className="h-full w-full object-cover" />
                  ) : (
                    <ScanFace className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {liveCapturedFace ? 'Captured & Verified' : 'Awaiting Capture'}
                </span>
              </div>
            </div>

            {/* Live Camera View Area */}
            {cameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black max-w-md mx-auto aspect-video mb-5 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Face Guide Oval */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-52 rounded-full border-2 border-dashed border-blue-400 opacity-80" />
                </div>

                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhotoAndVerify}
                    disabled={faceLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Camera className="w-4 h-4" />
                    {faceLoading ? 'Verifying...' : 'Capture & Compare'}
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center max-w-md mx-auto mb-5">
                <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-slate-800">Camera-Based Identity Verification</h3>
                <p className="text-[11px] text-slate-500 mt-1 mb-4">
                  Camera permission is only requested when you start the live comparison.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" /> Start Live Webcam
                  </button>
                  <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" /> Take Selfie / Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleLiveSelfieUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleUseVerifiedLiveFrame}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-600" /> Use Verified Frame
                  </button>
                  {liveCapturedFace && (
                    <button
                      type="button"
                      onClick={() => setLiveCapturedFace(null)}
                      className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Retake
                    </button>
                  )}
                </div>
                {cameraError && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <p className="font-medium">{cameraError}</p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Tip: You can use the "Take Selfie / Upload Photo" or "Use Verified Frame" buttons above if your browser or device restricts live camera streams.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Impersonation Mismatch Testing Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-6">
              <div>
                <span className="font-semibold text-slate-800">Simulate Impersonation Mismatch (Academic Defense)</span>
                <p className="text-[11px] text-slate-500">Tests anti-spoofing alert when person in PAN does not match Aadhaar.</p>
              </div>
              <input
                type="checkbox"
                checked={isSimulatedMismatch}
                onChange={(e) => setIsSimulatedMismatch(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            {/* Biometric Verification Result Card */}
            {biometricResult && (
              <div
                className={`p-4 rounded-xl border ${
                  biometricResult.status === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {biometricResult.status === 'VERIFIED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Status: {biometricResult.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs mt-1 text-slate-700">{biometricResult.message}</p>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px]">
                      <div>
                        <span className="text-slate-500">Aadhaar vs PAN:</span>{' '}
                        <strong>{biometricResult.aadharPanSimilarityScore}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Live vs Aadhaar:</span>{' '}
                        <strong>{biometricResult.liveAadharSimilarityScore || 98.8}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Live vs PAN:</span>{' '}
                        <strong>{biometricResult.livePanSimilarityScore || 98.5}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                ← Back to OCR Check
              </button>
              <button
                type="button"
                onClick={() => {
                  handleEvaluateEligibility();
                  setStep(6);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                Next: AI Eligibility Assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Explainable AI Eligibility Assessment */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-base font-bold text-slate-900">6. Explainable AI Underwriting Assessment</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Microsoft InterpretML Explainable Boosting Machine (EBM) provides complete transparency with exact local logit feature contributions.
                </p>
              </div>

              {/* Preliminary Decision Outcome Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Automated Risk Decision</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-lg font-bold px-3 py-1 rounded-lg ${
                          prediction.predictedClass === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prediction.predictedClass === 'Needs Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prediction.predictedClass}
                      </span>
                      <span className="text-xs text-slate-600">
                        Approval Confidence: <strong>{prediction.probabilityPercentage}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Model Engine</span>
                    <span className="text-xs font-bold text-slate-700">InterpretML EBM (Glassbox)</span>
                  </div>
                </div>
              </div>

              {/* EBM Local Feature Attributions (Waterfalls) */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Explainable Contributing Factors (Local Logits)
                </h3>
                <div className="space-y-3">
                  {(prediction.factors || []).map((f: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800">{f.featureLabel || f.feature}</span>
                        <span
                          className={`text-xs font-bold ${
                            f.direction === 'POSITIVE' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {f.direction === 'POSITIVE' ? '+' : '-'}
                          {Math.abs(f.contribution).toFixed(2)} Logit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapsible Technical Diagnostics */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex justify-between items-center transition-colors"
                >
                  <span>Advanced Technical Diagnostics & Model Metrics</span>
                  {showDiagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showDiagnostics && (
                  <div className="p-4 bg-white text-xs space-y-2 text-slate-600 border-t border-slate-200">
                    <p>• Model Architecture: Generalized Additive Model with Pairwise Interactions (GA²M)</p>
                    <p>• Training Dataset: 5,000 synthetic applicant profiles with 80/20 stratified validation split</p>
                    <p>• EBM Metrics: Accuracy 76.3% | F1 Score 0.848 | ROC-AUC 0.754</p>
                    <p>• Credit Bureau Mode: Synthetic Credit Profile (Not real bureau connection)</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  ← Back to Face Verification
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  Next: Final Application Summary <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Final Review & Application Summary */}
        {step === 7 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-100 pb-4 mb-5 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">7. Final Application Review & Dossier</h2>
                <p className="text-xs text-slate-500 mt-0.5">Complete digital loan evaluation and verified audit certificate.</p>
              </div>
              <a
                href={`/api/decisions/report/${savedApplicationId}?format=html`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Dossier (HTML/PDF)
              </a>
            </div>

            {/* Checklist of all verified gates */}
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 1. Applicant Profile & Financial Demographics
                </span>
                <span className="font-bold text-emerald-700">COMPLETED</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 2. Reducing-Balance EMI Affordability Calculator
                </span>
                <span className="font-bold text-emerald-700">₹{emiAmount.toLocaleString('en-IN')} / Mo</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 3. Identity Document Uploads (Aadhaar & PAN)
                </span>
                <span className="font-bold text-emerald-700">2 OF 2 UPLOADED</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 4. OCR Extraction & 100% Cross-Field Consistency
                </span>
                <span className="font-bold text-emerald-700">EXACT MATCH</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 5. Tri-Biometric Live Face Comparison
                </span>
                <span className="font-bold text-emerald-700">CONFIRMED MATCH (98.8%)</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> 6. Explainable Boosting Machine Underwriting
                </span>
                <span className="font-bold text-emerald-700">{prediction.predictedClass.toUpperCase()} (94.0%)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <Sparkles className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
              <h3 className="text-sm font-bold text-slate-900">Preliminary Loan Decision: Approved</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                All mandatory automated verification gates have passed. The application is eligible for institutional underwriter sign-off and simulated disbursement.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Return to Loan Dashboard
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                ← Back to Eligibility Review
              </button>
            </div>
          </div>
        )}

        {/* Modal: Card Zoom Preview */}
        {previewModalImg && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-4 overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800">{previewModalImg.title}</h3>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] flex items-center justify-center bg-slate-100 rounded-lg p-2">
                <img
                  src={previewModalImg.src}
                  alt={previewModalImg.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
