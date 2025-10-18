'use client';
import { authFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

// --- Interfaces para los datos del Dashboard ---
interface KpiData {
    totalSales: number;
    totalCostOfGoodsSold: number;
    grossProfit: number;
    totalExpenses: number;
    netResult: number;
    lowStockProducts: number;
}

interface CommercialEvent {
    name: string;
    date: string;
    suggestion: string;
}

interface StockAnalysisData {
    topSellingProducts: { name: string; totalSold: string }[];
    slowMovingProducts: { id: string; name: string; stockQuantity: number; cost: number }[];
}

// --- Componente de Tarjeta de KPI ---
interface StatCardProps {
    title: string;
    value: number;
    isCurrency?: boolean;
}

const StatCard = ({ title, value, isCurrency = false }: StatCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className={`mt-2 text-3xl font-bold ${isCurrency && value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {isCurrency ? `$${value.toFixed(2)}` : value}
        </p>
    </div>
);

// --- Página Principal del Dashboard ---
export default function DashboardHomePage() {
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [events, setEvents] = useState<CommercialEvent[]>([]);
    const [stockAnalysis, setStockAnalysis] = useState<StockAnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpisRes, eventsRes, stockRes] = await Promise.all([
                    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/kpis`),
                    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/events`),
                    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stock-analysis`)
                ]);
                setKpis(await kpisRes.json());
                setEvents(await eventsRes.json());
                setStockAnalysis(await stockRes.json());
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <p className='p-8'>Cargando métricas e inteligencia de negocio...</p>;

    return (
        <main className="p-8 space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Principal</h1>
                {kpis ? (
                    <>
                        <h2 className="text-lg font-semibold text-gray-600 mb-3">Resumen Financiero</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatCard title="Ventas Totales" value={kpis.totalSales} isCurrency />
                            <StatCard title="Costo de Mercadería" value={kpis.totalCostOfGoodsSold} isCurrency />
                            <StatCard title="Ganancia Bruta" value={kpis.grossProfit} isCurrency />
                            <StatCard title="Gastos Operativos" value={kpis.totalExpenses} isCurrency />
                            <StatCard title="Ganancia Neta (Real)" value={kpis.netResult} isCurrency />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-600 mt-8 mb-3">Resumen de Inventario</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                             <StatCard title="Productos Sin Stock" value={kpis.lowStockProducts} />
                        </div>
                    </>
                ) : ( <p>No se pudieron cargar las métricas.</p> )}
            </div>

            {stockAnalysis && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Análisis de Inventario (Últimos 90 días)</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="font-semibold text-green-700 mb-3">📈 Top 5 Productos Más Vendidos</h3>
                            <ul className="space-y-2">
                                {stockAnalysis.topSellingProducts.map(product => (
                                    <li key={product.name} className="flex justify-between items-center text-sm border-b pb-1">
                                        <span>{product.name}</span>
                                        <span className="font-bold">{product.totalSold} uds.</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="font-semibold text-red-700 mb-3">📉 Productos Estancados (Sin Ventas)</h3>
                            <ul className="space-y-2">
                                {stockAnalysis.slowMovingProducts.map(product => (
                                    <li key={product.id} className="flex justify-between items-center text-sm border-b pb-1">
                                        <span>{product.name}</span>
                                        <span className="text-red-500 font-semibold">Stock: {product.stockQuantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            {events.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Eventos Próximos y Sugerencias</h2>
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        {events.map(event => (
                            <div key={event.name} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-semibold text-blue-800">{event.name} - <span className="font-normal text-gray-600">{new Date(event.date).toLocaleDateString()}</span></p>
                                <p className="text-sm text-blue-700 mt-1">💡 <span className="font-medium">Sugerencia:</span> {event.suggestion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}