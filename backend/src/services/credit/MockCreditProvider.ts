import { ICreditProvider, CreditVerificationInput, CreditVerificationResult } from './CreditProvider';

export class MockCreditProvider implements ICreditProvider {
  public name = 'MOCK_CREDIT_BUREAU';

  public async verifyCreditProfile(
    input: CreditVerificationInput
  ): Promise<CreditVerificationResult> {
    if (!input.consentGiven) {
      throw new Error('Applicant consent is legally required before credit data can be recorded');
    }

    const pay = input.paymentHistory !== undefined ? Math.max(0, Math.min(100, input.paymentHistory)) : 85;
    const util = input.creditUtilization !== undefined ? Math.max(0, Math.min(100, input.creditUtilization)) : 30;
    const yrs = input.creditHistoryYears !== undefined ? Math.max(0, Math.min(30, input.creditHistoryYears)) : 5;
    const enq = input.recentEnquiries !== undefined ? Math.max(0, Math.min(20, input.recentEnquiries)) : 1;

    // Consistency check calculation
    const payNorm = pay / 100.0;
    const utilNorm = (100.0 - util) / 100.0;
    const yrsNorm = Math.min(20.0, yrs) / 20.0;
    const enqNorm = Math.max(0.0, 10.0 - enq) / 10.0;
    const estimatedScore = Math.round(300 + 600 * (0.35 * payNorm + 0.3 * utilNorm + 0.15 * yrsNorm + 0.2 * enqNorm));

    const diff = Math.abs(input.cibilScore - estimatedScore);
    const isConsistent = diff <= 65;

    return {
      applicationId: input.applicationId,
      cibilScore: input.cibilScore,
      paymentHistory: pay,
      creditUtilization: util,
      creditHistoryYears: yrs,
      recentEnquiries: enq,
      verificationStatus: 'DEMO_UNVERIFIED',
      provider: 'MOCK_CREDIT_BUREAU',
      consentTimestamp: new Date(),
      consistencyScore: estimatedScore,
      notes: isConsistent
        ? `Demo credit check: Declared habits correspond to estimated score of ${estimatedScore}, consistent with declared ${input.cibilScore}.`
        : `Demo credit check: Declared habits correspond to estimated score of ${estimatedScore}, which differs from declared ${input.cibilScore}.`,
    };
  }
}
