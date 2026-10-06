import { ICreditProvider } from './CreditProvider';
import { MockCreditProvider } from './MockCreditProvider';
import { VerifiedCreditProvider } from './VerifiedCreditProvider';
import { config } from '../../config';

export function getCreditProvider(overrideMode?: string): ICreditProvider {
  const mode = (overrideMode || config.creditProvider.mode).toLowerCase();
  if (mode === 'verified') {
    return new VerifiedCreditProvider();
  }
  return new MockCreditProvider();
}

export * from './CreditProvider';
export * from './MockCreditProvider';
export * from './VerifiedCreditProvider';
