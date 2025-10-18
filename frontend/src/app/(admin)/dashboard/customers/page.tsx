'use client';

import CustomerModal from '@/components/CustomerModal';
import { Customer, PriceList } from '@/lib/types';
import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]); // <-- NUEVO ESTADO
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const customersApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/customers`;
  const priceListsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/price-lists`; // <-- NUEVA URL

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Hacemos ambas peticiones en paralelo
      const [customersRes, priceListsRes] = await Promise.all([
        authFetch(customersApiUrl),
        authFetch(priceListsApiUrl),
      ]);
      const customersData = await customersRes.json();
      const priceListsData = await priceListsRes.json();
      setCustomers(customersData);
      setPriceLists(priceListsData); // <-- GUARDAR LISTAS DE PRECIOS
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (customer?: Customer) => {
    setSelectedCustomer(customer || {});
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    const isNew = !customerData.id;
    const url = isNew ? customersApiUrl : `${customersApiUrl}/${customerData.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error('Failed to save customer');
      
      await fetchData(); // Recargamos todos los datos
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      handleCloseModal();
    }
  };
  
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) return;
    try {
      const response = await authFetch(`${customersApiUrl}/${customerId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete customer');
      await fetchData();
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Agregar Cliente
        </button>
      </div>

      {isLoading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUIT / DNI</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.cuitDni}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenModal(customer)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <CustomerModal 
          customer={selectedCustomer}
          priceLists={priceLists} // <-- PASAR LISTAS AL MODAL
          onClose={handleCloseModal}
          onSave={handleSaveCustomer}
        />
      )}
    </main>
  );
}