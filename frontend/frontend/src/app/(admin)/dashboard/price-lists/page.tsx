'use client';

import PriceListModal from '@/components/PriceListModal';
import { authFetch } from '@/lib/api';
import { PriceList } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedPriceList, setSelectedPriceList] = useState<Partial<PriceList> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/price-lists`;

  const fetchPriceLists = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch price lists');
      const data = await response.json();
      setPriceLists(data);
    } catch (error) {
      console.error("Error fetching price lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const handleOpenModal = (priceList?: PriceList) => {
    setSelectedPriceList(priceList || {});
  };

  const handleCloseModal = () => {
    setSelectedPriceList(null);
  };

  const handleSavePriceList = async (priceListData: Partial<PriceList>) => {
    const isNew = !priceListData.id;
    const url = isNew ? apiUrl : `${apiUrl}/${priceListData.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(priceListData),
      });
      if (!response.ok) throw new Error('Failed to save price list');
      
      await fetchPriceLists();
    } catch (error) {
      console.error("Error saving price list:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeletePriceList = async (listId: number) => {
    if (!confirm(`¿Está seguro de que desea eliminar la lista de precios?`)) return;
    try {
        const response = await authFetch(`${apiUrl}/${listId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete price list');
        await fetchPriceLists();
    } catch (error) {
        console.error("Error deleting price list:", error);
    }
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Listas de Precios</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Crear Nueva Lista
        </button>
      </div>

      {isLoading ? (
        <p>Cargando listas de precios...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen (%)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceLists.map((list) => (
                <tr key={list.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{list.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.marginPercentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(list)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => handleDeletePriceList(list.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPriceList && (
        <PriceListModal 
          priceList={selectedPriceList}
          onClose={handleCloseModal}
          onSave={handleSavePriceList}
        />
      )}
    </main>
  );
}