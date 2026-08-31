import { z } from 'zod';

export const createClaimSchema = z.object({
  type: z.enum(['VEHICLE', 'HOME', 'LIABILITY']),
  policyNumber: z.string().min(1, 'Policy number is required'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  incidentLocation: z.string().min(1, 'Incident location is required'),
  description: z.string().min(10, 'Please provide at least 10 characters'),
  estimatedDamage: z.coerce.number().positive('Must be a positive number').optional(),
  otherPartyInvolved: z.boolean().optional(),
  hasPoliceReport: z.boolean().optional(),
  hasWitnesses: z.boolean().optional(),
});

export type CreateClaimFormInput = z.input<typeof createClaimSchema>;
export type CreateClaimFormData = z.infer<typeof createClaimSchema>;