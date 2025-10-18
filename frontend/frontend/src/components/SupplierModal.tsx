'use client';

import { Supplier } from '@/lib/types';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface SupplierModalProps {
  supplier: Partial<Supplier> | null;
  onClose: () => void;
  onSave: (supplier: Partial<Supplier>) => void;
}

export default function SupplierModal({ supplier, onClose, onSave }: SupplierModalProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>({});

  useEffect(() => {
    setFormData(supplier && Object.keys(supplier).length > 0 ? { ...supplier } : { name: '' });
  }, [supplier]);

  if (!supplier) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Editar' : 'Crear'} Proveedor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cuit" className="block text-sm font-medium text-gray-700">CUIT</label>
              <input type="text" name="cuit" value={formData.cuit || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Persona de Contacto</label>
              <input type="text" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
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