'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClaimSchema, CreateClaimFormInput } from '@/lib/schemas/claim';
import { apiFetch } from '@/lib/api';

export default function NewClaimPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClaimFormInput>({
    resolver: zodResolver(createClaimSchema),
  });

  async function onSubmit(data: CreateClaimFormInput) {
    setSubmitError('');
    try {
      const parsed = createClaimSchema.parse(data);
      await apiFetch('/claims', {
        method: 'POST',
        body: JSON.stringify(parsed),
      });
      router.push('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit claim');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">File a new claim</h1>

      {submitError && <p className="text-red-600 mb-4">{submitError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Claim type</label>
          <select {...register('type')} className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="HOME">Home</option>
            <option value="LIABILITY">Liability</option>
          </select>
          {errors.type && <p className="text-red-600 text-sm">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Policy number</label>
          <input {...register('policyNumber')} className="w-full border rounded px-3 py-2" />
          {errors.policyNumber && <p className="text-red-600 text-sm">{errors.policyNumber.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Incident date</label>
          <input type="date" {...register('incidentDate')} className="w-full border rounded px-3 py-2" />
          {errors.incidentDate && <p className="text-red-600 text-sm">{errors.incidentDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Incident location</label>
          <input {...register('incidentLocation')} className="w-full border rounded px-3 py-2" />
          {errors.incidentLocation && <p className="text-red-600 text-sm">{errors.incidentLocation.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea {...register('description')} rows={4} className="w-full border rounded px-3 py-2" />
          {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estimated damage (€)</label>
          <input type="number" step="0.01" {...register('estimatedDamage')} className="w-full border rounded px-3 py-2" />
          {errors.estimatedDamage && <p className="text-red-600 text-sm">{errors.estimatedDamage.message}</p>}
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('otherPartyInvolved')} />
          <span className="text-sm">Other party involved</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('hasPoliceReport')} />
          <span className="text-sm">Police report filed</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('hasWitnesses')} />
          <span className="text-sm">Witnesses present</span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Save as draft'}
        </button>
      </form>
    </div>
  );
}