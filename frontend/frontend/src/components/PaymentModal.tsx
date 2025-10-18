'use client';
import { FormEvent, useState } from 'react';

interface PaymentModalProps {
  customer: { id: string, firstName: string, lastName: string };
  onClose: () => void;
  onSave: (paymentData: any) => void;
}

export default function PaymentModal({ customer, onClose, onSave }: PaymentModalProps) {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ customerId: customer.id, amount, paymentMethod, notes });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Registrar Pago</h2>
        <p className="mb-6 text-gray-600">para {customer.firstName} {customer.lastName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto</label>
            <input type="number" name="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} required step="0.01" min="0.01" className="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <select name="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md bg-white">
                <option>Transferencia</option>
                <option>Efectivo</option>
                <option>Mercado Pago</option>
                <option>Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
            <input type="text" name="notes" value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Pago</button>
          </div>
        </form>
      </div>
    </div>
  );
}