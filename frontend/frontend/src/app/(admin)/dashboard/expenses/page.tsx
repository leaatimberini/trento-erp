'use client';

import ExpenseModal from '@/components/ExpenseModal';
import { authFetch } from '@/lib/api';
import { Expense, ExpenseCategory } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Partial<Expense> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/expenses`;
  const categoriesApiUrl = `${apiUrl}/categories`;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        authFetch(apiUrl),
        authFetch(categoriesApiUrl)
      ]);
      setExpenses(await expensesRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (expense?: Expense) => {
    setSelectedExpense(expense || {});
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
  };

  const handleSaveExpense = async (expenseData: Partial<Expense>) => {
    const isNew = !expenseData.id;
    const url = isNew ? apiUrl : `${apiUrl}/${expenseData.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
        const response = await authFetch(url, { method, body: JSON.stringify(expenseData) });
        if (!response.ok) throw new Error('Failed to save expense');
        await fetchData();
    } catch (error) {
        console.error("Error saving expense:", error);
        alert('Error al registrar el gasto');
    } finally {
        handleCloseModal();
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este gasto?')) return;
    try {
      const response = await authFetch(`${apiUrl}/${expenseId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete expense');
      await fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert('Error al eliminar el gasto.');
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Registrar Gasto
        </button>
      </div>

      {isLoading ? (
        <p>Cargando gastos...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">${expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(expense)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedExpense && (
        <ExpenseModal
          // Necesitamos pasar el 'expense' al modal para la edición
          expense={selectedExpense}
          categories={categories}
          onClose={handleCloseModal}
          onSave={handleSaveExpense}
        />
      )}
    </main>
  );
}