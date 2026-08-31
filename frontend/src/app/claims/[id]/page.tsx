'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Claim } from '@/lib/types';
import { NEXT_ACTIONS } from '@/lib/claim-actions';

interface Document {
  id: string;
  type: string;
  filename: string;
  status: string;
  uploadedAt: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
}

interface ClaimDetail extends Claim {
  documents: Document[];
  auditLogs: AuditLogEntry[];
}

export default function ClaimDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const claimId = params.id as string;

  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [claimLoading, setClaimLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchClaim = useCallback(() => {
    setClaimLoading(true);
    apiFetch(`/claims/${claimId}`)
      .then(setClaim)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load claim'))
      .finally(() => setClaimLoading(false));
  }, [claimId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchClaim();
  }, [user, fetchClaim]);

  async function handleTransition(nextStatus: Claim['status']) {
    setActionInProgress(true);
    setError('');
    try {
      await apiFetch(`/claims/${claimId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleAssign() {
    setActionInProgress(true);
    setError('');
    try {
      await apiFetch(`/claims/${claimId}/assign`, { method: 'PATCH' });
      fetchClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setActionInProgress(false);
    }
  }

  if (loading || claimLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || !claim) {
    return <div className="p-8 text-red-600">{error || 'Claim not found'}</div>;
  }

  const availableActions = NEXT_ACTIONS[claim.status].filter((a) => a.requiredRole === user.role);
  const canAssign = user.role === 'CLAIMS_HANDLER' && !claim.assignedHandlerId;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{claim.claimNumber}</h1>
        <p className="text-gray-600">{claim.type} · Status: {claim.status.replace(/_/g, ' ')}</p>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Incident</h2>
          <p className="text-sm">{new Date(claim.incidentDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">{claim.incidentLocation}</p>
          <p className="text-sm mt-2">{claim.description}</p>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Assessment</h2>
          <p className="text-sm">Policy: {claim.policyNumber}</p>
          {claim.estimatedDamage && <p className="text-sm">Estimated: €{claim.estimatedDamage.toLocaleString()}</p>}
          <p className="text-sm text-gray-600 mt-2">
            Handler: {claim.assignedHandlerId ? 'Assigned' : 'Unassigned'}
          </p>
        </section>
      </div>

      <section className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Documents ({claim.documents.length})</h2>
        {claim.documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {claim.documents.map((doc) => (
              <li key={doc.id}>
                {doc.filename} — {doc.type} ({doc.status})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Timeline</h2>
        <ul className="text-sm space-y-2">
          {claim.auditLogs.map((log) => (
            <li key={log.id} className="text-gray-600">
              {new Date(log.createdAt).toLocaleString()} — {log.action}
              {log.fromValue && log.toValue && ` (${log.fromValue} → ${log.toValue})`}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-3 flex-wrap">
        {canAssign && (
          <button
            onClick={handleAssign}
            disabled={actionInProgress}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Assign to me
          </button>
        )}
        {availableActions.map((action) => (
          <button
            key={action.nextStatus}
            onClick={() => handleTransition(action.nextStatus)}
            disabled={actionInProgress}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}