const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}