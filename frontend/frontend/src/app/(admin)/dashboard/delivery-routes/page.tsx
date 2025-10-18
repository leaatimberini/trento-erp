'use client';

import { authFetch } from '@/lib/api';
import { DeliveryRoute } from '@/lib/types';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

export default function DeliveryRoutesPage() {
    const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [driverName, setDriverName] = useState('');
    const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/delivery-routes`;

    const fetchRoutes = async () => {
        setIsLoading(true);
        try {
            const res = await authFetch(apiUrl);
            setRoutes(await res.json());
        } catch (error) {
            console.error("Error fetching routes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleCreateRoute = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await authFetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ driverName, routeDate })
            });
            if (!res.ok) throw new Error('Failed to create route');
            await fetchRoutes(); // Recargar la lista
            setDriverName(''); // Resetear formulario
        } catch (error) {
            console.error("Error creating route:", error);
            alert("Error al crear la ruta.");
        }
    };

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Rutas de Reparto</h1>
            
            {/* Formulario de Creación */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Crear Nueva Ruta</h2>
                <form onSubmit={handleCreateRoute} className="flex items-end gap-4">
                    <div>
                        <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Nombre del Repartidor</label>
                        <input type="text" id="driverName" value={driverName} onChange={e => setDriverName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="routeDate" className="block text-sm font-medium text-gray-700">Fecha de la Ruta</label>
                        <input type="date" id="routeDate" value={routeDate} onChange={e => setRouteDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Crear Ruta</button>
                </form>
            </div>

            {/* Tabla de Rutas Existentes */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repartidor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {routes.map(route => (
                            <tr key={route.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(route.routeDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.driverName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{route.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/dashboard/delivery-routes/${route.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Ver Detalle
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}