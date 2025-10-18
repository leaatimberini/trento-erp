'use client';

import SupplierModal from '@/components/SupplierModal';
import { authFetch } from '@/lib/api';
import { Supplier } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Partial<Supplier> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/suppliers`;

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(apiUrl);
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier?: Supplier) => {
    setSelectedSupplier(supplier || {});
  };

  const handleCloseModal = () => {
    setSelectedSupplier(null);
  };

  const handleSaveSupplier = async (supplierData: Partial<Supplier>) => {
    const isNew = !supplierData.id;
    const url = isNew ? apiUrl : `${apiUrl}/${supplierData.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(supplierData),
      });
      if (!response.ok) throw new Error('Failed to save supplier');
      
      await fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
    } finally {
      handleCloseModal();
    }
  };
  
  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este proveedor?')) return;
    
    try {
      const response = await authFetch(`${apiUrl}/${supplierId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete supplier');
      
      await fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Proveedores</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Agregar Proveedor
        </button>
      </div>

      {isLoading ? (
        <p>Cargando proveedores...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(supplier)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSupplier && (
        <SupplierModal 
          supplier={selectedSupplier}
          onClose={handleCloseModal}
          onSave={handleSaveSupplier}
        />
      )}
    </main>
  );
}