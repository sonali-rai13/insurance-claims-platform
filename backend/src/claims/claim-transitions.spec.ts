import { canTransition } from './claim-transitions';

describe('canTransition', () => {
  it('allows a customer to submit their own draft claim', () => {
    expect(canTransition('DRAFT', 'SUBMITTED', 'CUSTOMER')).toBe(true);
  });

  it('does not allow a customer to approve a claim', () => {
    expect(canTransition('UNDER_ASSESSMENT', 'APPROVED', 'CUSTOMER')).toBe(false);
  });

  it('allows a handler to approve a claim under assessment', () => {
    expect(canTransition('UNDER_ASSESSMENT', 'APPROVED', 'CLAIMS_HANDLER')).toBe(true);
  });

  it('does not allow skipping states, e.g. DRAFT straight to APPROVED', () => {
    expect(canTransition('DRAFT', 'APPROVED', 'CLAIMS_HANDLER')).toBe(false);
  });

  it('does not allow any transition out of a terminal state (REJECTED)', () => {
    expect(canTransition('REJECTED', 'SETTLED', 'CLAIMS_HANDLER')).toBe(false);
  });

  it('does not allow any transition out of a terminal state (SETTLED)', () => {
    expect(canTransition('SETTLED', 'DRAFT', 'CLAIMS_HANDLER')).toBe(false);
  });

  it('allows a handler to move a claim from additional-info-required back to assessment', () => {
    expect(canTransition('ADDITIONAL_INFO_REQUIRED', 'UNDER_ASSESSMENT', 'CLAIMS_HANDLER')).toBe(true);
  });
});