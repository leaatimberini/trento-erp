'use client';

import { PriceList } from '@/lib/types';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface PriceListModalProps {
  priceList: Partial<PriceList> | null;
  onClose: () => void;
  onSave: (priceList: Partial<PriceList>) => void;
}

export default function PriceListModal({ priceList, onClose, onSave }: PriceListModalProps) {
  const [formData, setFormData] = useState<Partial<PriceList>>({});

  useEffect(() => {
    setFormData(priceList && Object.keys(priceList).length > 0 ? { ...priceList } : { name: '', description: '', marginPercentage: 0 });
  }, [priceList]);

  if (!priceList) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Editar' : 'Crear'} Lista de Precios</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Lista</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="marginPercentage" className="block text-sm font-medium text-gray-700">Margen de Ganancia (%)</label>
            <input type="number" name="marginPercentage" value={formData.marginPercentage || 0} onChange={handleChange} required step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
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