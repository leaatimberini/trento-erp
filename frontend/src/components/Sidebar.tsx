'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Configuración', href: '/dashboard/settings' },
  { name: 'Productos', href: '/dashboard/products' },
  { name: 'Clientes', href: '/dashboard/customers' },
  { name: 'Órdenes', href: '/dashboard/orders' },
  { name: 'Órdenes de Compra', href: '/dashboard/purchase-orders' },
  { name: 'Listas de Precios', href: '/dashboard/price-lists' },
  { name: 'Proveedores', href: '/dashboard/suppliers' },
  { name: 'Cuentas Corrientes', href: '/dashboard/accounts' },
  { name: 'Gastos', href: '/dashboard/expenses' },
  { name: 'Rutas de Reparto', href: '/dashboard/delivery-routes' }, // <-- AÑADIR

];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">TRENTO ERP</h2>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-700">
        <button 
          onClick={logout}
          className="w-full block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors text-left"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}