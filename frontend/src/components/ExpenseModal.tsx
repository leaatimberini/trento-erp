'use client';

import { Expense, ExpenseCategory } from '@/lib/types';
import { FormEvent, useEffect, useState } from 'react';

interface ExpenseModalProps {
  expense: Partial<Expense> | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSave: (expenseData: any) => void;
}

export default function ExpenseModal({ expense, categories, onClose, onSave }: ExpenseModalProps) {
  const [formData, setFormData] = useState<Partial<Expense>>({});
  
  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        categoryId: expense.category?.id,
      });
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { category, ...payload } = formData; // Excluimos el objeto 'category'
    onSave(payload);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'categoryId' || name === 'amount' ? (value === '' ? null : Number(value)) : value;
    setFormData(prev => ({...prev, [name]: finalValue}));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Editar' : 'Registrar'} Gasto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <input type="text" name="description" value={formData.description || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto</label>
              <input type="number" name="amount" value={formData.amount || 0} onChange={handleChange} required step="0.01" min="0.01" className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Categoría</label>
              <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white">
                  <option value="">-- Sin Categoría --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Gasto</button>
          </div>
        </form>
      </div>
    </div>
  );
}