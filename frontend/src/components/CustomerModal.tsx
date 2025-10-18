'use client';

import { Customer, PriceList } from '@/lib/types';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface CustomerModalProps {
  customer: Partial<Customer> | null;
  priceLists: PriceList[];
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
}

export default function CustomerModal({ customer, priceLists, onClose, onSave }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    setFormData(customer && Object.keys(customer).length > 0 ? { ...customer } : { firstName: '', lastName: '' });
  }, [customer]);

  if (!customer) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'priceListId' ? (value ? parseInt(value, 10) : null) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
              <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          {/* --- INICIO DE LA MODIFICACIÓN --- */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          {/* --- FIN DE LA MODIFICACIÓN --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cuitDni" className="block text-sm font-medium text-gray-700">CUIT / DNI</label>
              <input type="text" name="cuitDni" value={formData.cuitDni || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div>
            <label htmlFor="priceListId" className="block text-sm font-medium text-gray-700">Lista de Precios</label>
            <select
              name="priceListId"
              id="priceListId"
              value={formData.priceListId || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">-- Sin asignar --</option>
              {priceLists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}