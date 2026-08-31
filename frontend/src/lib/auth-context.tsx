'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface AuthUser {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'CLAIMS_HANDLER';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<{ sub: string; email: string; role: 'CUSTOMER' | 'CLAIMS_HANDLER'; exp: number }>(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) return null;
    return { userId: decoded.sub, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decodedUser = decodeToken(token);
      if (!decodedUser) {
        localStorage.removeItem('accessToken');
      }
      setUser(decodedUser);
    }
    setLoading(false);
  }, []);

  function login(token: string) {
    localStorage.setItem('accessToken', token);
    setUser(decodeToken(token));
  }

  function logout() {
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}