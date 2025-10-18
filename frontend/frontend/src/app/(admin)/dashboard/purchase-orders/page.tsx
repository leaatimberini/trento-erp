'use client';
import { PurchaseOrder } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders`;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(apiUrl);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReceiveOrder = async (orderId: string) => {
    if (!confirm('¿Está seguro de que desea marcar esta orden como recibida? Esta acción incrementará el stock de los productos.')) return;
    
    try {
      const response = await authFetch(`${apiUrl}/${orderId}/receive`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to receive order');
      }
      alert('¡Orden recibida con éxito! El stock ha sido actualizado.');
      await fetchOrders(); // Recargar la lista para ver el cambio de estado
    } catch (error) {
      // --- INICIO DE LA CORRECCIÓN ---
      console.error("Error receiving order:", error);
      let errorMessage = 'Error al recibir la orden.';
      if (error instanceof Error) {
        errorMessage = `Error al recibir la orden: ${error.message}`;
      }
      alert(errorMessage);
      // --- FIN DE LA CORRECCIÓN ---
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Órdenes de Compra</h1>
        <Link href="/dashboard/purchase-orders/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Crear Orden de Compra
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID de Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{order.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  <span className={`px-2 inline-flex text-xs leading-5 rounded-full ${
                    order.status === 'fully_received' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status === 'pending' && (
                    <button onClick={() => handleReceiveOrder(order.id)} className="text-green-600 hover:text-green-900">
                      Recibir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}