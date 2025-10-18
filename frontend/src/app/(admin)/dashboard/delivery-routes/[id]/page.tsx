'use client';

import { authFetch } from '@/lib/api';
import { DeliveryRoute, Order } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeliveryRouteDetailPage() {
    const [route, setRoute] = useState<DeliveryRoute | null>(null);
    const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const id = params.id as string;

    const fetchAllData = async () => {
        if (id) {
            setIsLoading(true);
            try {
                const [routeRes, unassignedRes] = await Promise.all([
                    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-routes/${id}`),
                    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/unassigned`),
                ]);
                
                if (routeRes.ok) setRoute(await routeRes.json());
                if (unassignedRes.ok) setUnassignedOrders(await unassignedRes.json());

            } catch (err) {
                console.error("Failed to fetch route data", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const handleSelectOrder = (orderId: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handleAssignOrders = async () => {
        if (selectedOrderIds.length === 0) return;
        try {
            await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-routes/${id}/assign-orders`, {
                method: 'POST',
                body: JSON.stringify({ orderIds: selectedOrderIds }),
            });
            setSelectedOrderIds([]);
            await fetchAllData();
        } catch (error) {
            console.error("Failed to assign orders", error);
            alert("Error al asignar las órdenes.");
        }
    };

    if (isLoading) return <p className="p-8">Cargando detalles de la ruta...</p>;
    if (!route) return <p className="p-8">No se encontró la ruta de reparto.</p>;

    return (
        <main className="p-8">
            <div className="mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Hoja de Ruta</h1>
                <p className="text-lg text-gray-600">Repartidor: <span className="font-semibold">{route.driverName}</span></p>
                <p className="text-lg text-gray-600">Fecha: <span className="font-semibold">{new Date(route.routeDate).toLocaleDateString()}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Órdenes Completadas (Sin Ruta)</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {unassignedOrders.length > 0 ? unassignedOrders.map(order => (
                            <div key={order.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={selectedOrderIds.includes(order.id)}
                                    onChange={() => handleSelectOrder(order.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className='flex-1'>
                                    <p className='font-medium'>{order.customer.firstName} {order.customer.lastName}</p>
                                    <p className='text-sm text-gray-500'>ID: {order.id.substring(0, 8)}... - Total: ${order.totalAmount}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500">No hay órdenes pendientes de asignar.</p>}
                    </div>
                    <button onClick={handleAssignOrders} disabled={selectedOrderIds.length === 0} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        Asignar Seleccionadas
                    </button>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Órdenes en esta Ruta ({route.orders?.length || 0})</h2>
                    <ul className='space-y-3 max-h-96 overflow-y-auto'>
                        {route.orders?.map(order => (
                            <li key={order.id} className='p-3 border-b bg-white rounded-md shadow-sm'>
                                <p className='font-semibold text-gray-800'>{order.customer.firstName} {order.customer.lastName}</p>
                                <p className='text-sm text-gray-600 mt-1'>Dirección: <span className="font-medium text-gray-800">{order.customer.address || 'No especificada'}</span></p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}