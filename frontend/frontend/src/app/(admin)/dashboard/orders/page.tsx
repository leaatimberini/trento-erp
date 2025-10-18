'use client';
import { Order } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState, FormEvent, FC } from 'react';
import { authFetch } from '@/lib/api';

// --- INICIO DE LA CORRECCIÓN: Definir los tipos para las props del Modal ---
interface ShippingCostModalProps {
    order: Order;
    onClose: () => void;
    onConfirm: (orderId: string, status: 'completed', cost: number) => void;
}
// --- FIN DE LA CORRECCIÓN ---

// Modal para el costo de envío
const ShippingCostModal: FC<ShippingCostModalProps> = ({ order, onClose, onConfirm }) => {
    const [cost, setCost] = useState(0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onConfirm(order.id, 'completed', cost);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4">Confirmar Orden y Envío</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700">
                        Costo de Envío para la Orden #{order.id.substring(0, 8)}
                    </label>
                    <input
                        id="shippingCost"
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(Number(e.target.value))}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(apiUrl);
      setOrders(await response.json());
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: 'completed' | 'cancelled', shippingCost?: number) => {
    const body = shippingCost !== undefined ? { status, shippingCost } : { status };
    if (status === 'cancelled' && !confirm(`¿Está seguro de que desea CANCELAR esta orden?`)) return;

    try {
      const response = await authFetch(`${apiUrl}/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to update status');
      await fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Error al actualizar el estado de la orden.');
    } finally {
        setModalOrder(null);
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Órdenes de Venta</h1>
        <Link href="/dashboard/orders/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Crear Orden
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customer.firstName} {order.customer.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{order.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {order.status === 'pending' && (
                      <>
                          <button onClick={() => setModalOrder(order)} className="text-green-600 hover:text-green-900">Marcar como Completada</button>
                          <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="text-red-600 hover:text-red-900">Cancelar</button>
                      </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOrder && (
          <ShippingCostModal 
            order={modalOrder}
            onClose={() => setModalOrder(null)}
            onConfirm={handleStatusChange}
          />
      )}
    </main>
  );
}