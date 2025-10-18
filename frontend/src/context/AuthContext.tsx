'use client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Esto podría expandirse para leer el token de localStorage para persistir la sesión
    if (!token) {
        // Lógica para redirigir si no hay token en rutas protegidas (se hará después)
    }
  }, [token, router]);

  const login = async (email: string, password: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();
    setToken(data.accessToken);
    
    // Almacenamiento simple para este ejemplo. En producción se usaría localStorage o cookies.
    sessionStorage.setItem('accessToken', data.accessToken);

    router.push('/dashboard/settings'); // Redirigir al dashboard después del login
  };

  const logout = () => {
    setToken(null);
    sessionStorage.removeItem('accessToken');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}