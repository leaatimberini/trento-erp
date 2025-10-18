'use client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cartItems, totalAmount, cartCount, clearCart } = useCart();
  const router = useRouter();
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cuitDni: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartCount === 0) {
      alert("Su carrito está vacío.");
      return;
    }
    setIsSubmitting(true);

    const orderPayload = {
      newCustomer: customerData,
      items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
    };

    const ordersApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
    const paymentsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/payments/create-preference`;

    try {
      // PASO 1: Crear la orden en nuestro sistema en estado 'pending'
      const orderResponse = await fetch(ordersApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || 'Error al crear la orden');
      }

      const createdOrder = await orderResponse.json();
      const orderId = createdOrder.id;

      // PASO 2: Crear la preferencia de pago en Mercado Pago
      const preferenceResponse = await fetch(paymentsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!preferenceResponse.ok) {
        throw new Error('Error al crear la preferencia de pago');
      }

      const preference = await preferenceResponse.json();
      
      // PASO 3: Limpiar carrito y redirigir al checkout de Mercado Pago
      clearCart();
      window.location.href = preference.init_point; // Redirección completa a sitio externo

    } catch (error) {
      let errorMessage = 'Hubo un problema al procesar su orden.';
      if (error instanceof Error) {
        errorMessage = `Hubo un problema: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Finalizar Compra</h1>
      <form id="checkout-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Datos de Contacto y Facturación</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input id="firstName" name="firstName" onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input id="lastName" name="lastName" onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label htmlFor="cuitDni" className="block text-sm font-medium text-gray-700">CUIT / DNI</label>
                  <input id="cuitDni" name="cuitDni" onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input id="phone" name="phone" onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-bold border-b pb-2">Resumen del Pedido</h2>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4 font-bold text-2xl flex justify-between">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <button 
              type="submit" 
              form="checkout-form"
              disabled={isSubmitting || cartCount === 0}
              className="mt-6 w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Procesando...' : 'Pagar con Mercado Pago'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}