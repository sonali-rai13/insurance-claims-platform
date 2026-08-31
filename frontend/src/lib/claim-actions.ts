import { Claim } from './types';

interface ActionOption {
  label: string;
  nextStatus: Claim['status'];
  requiredRole: 'CUSTOMER' | 'CLAIMS_HANDLER';
}

export const NEXT_ACTIONS: Record<Claim['status'], ActionOption[]> = {
  DRAFT: [{ label: 'Submit claim', nextStatus: 'SUBMITTED', requiredRole: 'CUSTOMER' }],
  SUBMITTED: [{ label: 'Start document review', nextStatus: 'DOCUMENT_REVIEW', requiredRole: 'CLAIMS_HANDLER' }],
  DOCUMENT_REVIEW: [{ label: 'Begin assessment', nextStatus: 'UNDER_ASSESSMENT', requiredRole: 'CLAIMS_HANDLER' }],
  UNDER_ASSESSMENT: [
    { label: 'Request additional info', nextStatus: 'ADDITIONAL_INFO_REQUIRED', requiredRole: 'CLAIMS_HANDLER' },
    { label: 'Approve claim', nextStatus: 'APPROVED', requiredRole: 'CLAIMS_HANDLER' },
    { label: 'Reject claim', nextStatus: 'REJECTED', requiredRole: 'CLAIMS_HANDLER' },
  ],
  ADDITIONAL_INFO_REQUIRED: [{ label: 'Resume assessment', nextStatus: 'UNDER_ASSESSMENT', requiredRole: 'CLAIMS_HANDLER' }],
  APPROVED: [{ label: 'Mark payment pending', nextStatus: 'PAYMENT_PENDING', requiredRole: 'CLAIMS_HANDLER' }],
  REJECTED: [],
  PAYMENT_PENDING: [{ label: 'Mark settled', nextStatus: 'SETTLED', requiredRole: 'CLAIMS_HANDLER' }],
  SETTLED: [],
};