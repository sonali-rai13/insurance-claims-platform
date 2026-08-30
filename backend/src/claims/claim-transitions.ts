import { ClaimStatus } from '@prisma/client';

type Role = 'CUSTOMER' | 'CLAIMS_HANDLER';

interface TransitionRule {
  to: ClaimStatus;
  allowedRoles: Role[];
}

export const ALLOWED_TRANSITIONS: Record<ClaimStatus, TransitionRule[]> = {
  DRAFT: [{ to: 'SUBMITTED', allowedRoles: ['CUSTOMER'] }],

  SUBMITTED: [{ to: 'DOCUMENT_REVIEW', allowedRoles: ['CLAIMS_HANDLER'] }],

  DOCUMENT_REVIEW: [{ to: 'UNDER_ASSESSMENT', allowedRoles: ['CLAIMS_HANDLER'] }],

  UNDER_ASSESSMENT: [
    { to: 'ADDITIONAL_INFO_REQUIRED', allowedRoles: ['CLAIMS_HANDLER'] },
    { to: 'APPROVED', allowedRoles: ['CLAIMS_HANDLER'] },
    { to: 'REJECTED', allowedRoles: ['CLAIMS_HANDLER'] },
  ],

  ADDITIONAL_INFO_REQUIRED: [{ to: 'UNDER_ASSESSMENT', allowedRoles: ['CLAIMS_HANDLER'] }],

  APPROVED: [{ to: 'PAYMENT_PENDING', allowedRoles: ['CLAIMS_HANDLER'] }],

  REJECTED: [],

  PAYMENT_PENDING: [{ to: 'SETTLED', allowedRoles: ['CLAIMS_HANDLER'] }],

  SETTLED: [],
};

export function canTransition(from: ClaimStatus, to: ClaimStatus, role: Role): boolean {
  const rules = ALLOWED_TRANSITIONS[from];
  return rules.some((rule) => rule.to === to && rule.allowedRoles.includes(role));
}