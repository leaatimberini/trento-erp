'use client';

import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  // No renderizar el contenido del dashboard hasta que se verifique el token
  // para evitar mostrar información protegida brevemente antes de redirigir.
  if (!isVerified) {
    return <main className="flex min-h-screen items-center justify-center"><p>Verificando sesión...</p></main>; 
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}