'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600">Logged in as {user.email} ({user.role})</p>
      <button onClick={logout} className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
        Log out
      </button>
    </div>
  );
}