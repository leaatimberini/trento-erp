'use client';

import PaymentModal from '@/components/PaymentModal';
import { authFetch } from '@/lib/api';
import { Customer } from '@/lib/types';
import { useEffect, useState } from 'react';

interface CustomerWithBalance extends Customer {
    balance: {
        totalBilled: number;
        totalPaid: number;
        totalDebt: number;
    }
}

export default function AccountsPage() {
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/customers/with-balances`;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(apiUrl);
      const data = await response.json();
      
      // --- INICIO DE LA MODIFICACIÓN DE DEPURACIÓN ---
      console.log('[DEBUG] Datos recibidos de la API:', data);
      // --- FIN DE LA MODIFICACIÓN DE DEPURACIÓN ---

      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customer balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePayment = async (paymentData: any) => {
    try {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/customer-payments`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
        if (!response.ok) throw new Error('Failed to save payment');
        await fetchData(); // Recargar todos los saldos
    } catch (error) {
        console.error("Error saving payment:", error);
        alert('Error al registrar el pago');
    } finally {
        setSelectedCustomer(null);
    }
  };

  // El JSX no cambia, pero se incluye completo para mantener la consistencia
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cuentas Corrientes de Clientes</h1>
      
      {isLoading ? (
        <p>Cargando estados de cuenta...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Facturado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pagado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Deudor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(customers) && customers.map((customer) => (
                <tr key={customer.id} className={customer.balance.totalDebt > 0 ? 'bg-red-50' : 'bg-green-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.balance.totalBilled.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.balance.totalPaid.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${customer.balance.totalDebt.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedCustomer(customer)} className="text-indigo-600 hover:text-indigo-900">
                      Registrar Pago
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <PaymentModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSave={handleSavePayment}
        />
      )}
    </main>
  );
}