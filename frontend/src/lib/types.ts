export interface Claim {
  id: string;
  claimNumber: string;
  customerId: string;
  assignedHandlerId: string | null;
  type: 'VEHICLE' | 'HOME' | 'LIABILITY';
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'DOCUMENT_REVIEW'
    | 'UNDER_ASSESSMENT'
    | 'ADDITIONAL_INFO_REQUIRED'
    | 'APPROVED'
    | 'REJECTED'
    | 'PAYMENT_PENDING'
    | 'SETTLED';
  policyNumber: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  estimatedDamage: number | null;
  createdAt: string;
  updatedAt: string;
}