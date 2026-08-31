'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Claim } from '@/lib/types';
import Link from 'next/link';

const STATUS_COLORS: Record<Claim['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DOCUMENT_REVIEW: 'bg-blue-100 text-blue-700',
  UNDER_ASSESSMENT: 'bg-yellow-100 text-yellow-700',
  ADDITIONAL_INFO_REQUIRED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PAYMENT_PENDING: 'bg-green-100 text-green-700',
  SETTLED: 'bg-gray-100 text-gray-700',
};

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    apiFetch('/claims')
      .then(setClaims)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load claims'))
      .finally(() => setClaimsLoading(false));
  }, [user]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600 text-sm">{user.email} ({user.role})</p>
        </div>
        <div className="flex gap-3">
          {user.role === 'CUSTOMER' && (
            <Link href="/claims/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              File a claim
            </Link>
          )}
          <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Log out
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {claimsLoading ? (
        <p className="text-gray-500">Loading claims...</p>
      ) : claims.length === 0 ? (
        <p className="text-gray-500">No claims yet.</p>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <Link
              key={claim.id}
              href={`/claims/${claim.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{claim.claimNumber}</p>
                  <p className="text-sm text-gray-600">{claim.type} · {claim.incidentLocation}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[claim.status]}`}>
                  {claim.status.replace(/_/g, ' ')}
                </span>
              </div>
              {claim.estimatedDamage && (
                <p className="text-sm text-gray-500 mt-2">Estimated: €{claim.estimatedDamage.toLocaleString()}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}