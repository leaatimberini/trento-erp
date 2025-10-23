'use client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function CheckoutPage() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cuitDni: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    const orderData = {
      newCustomer: formData,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };
    
    try {
      // 1. Crear la orden en nuestro sistema
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Hubo un problema al crear tu orden.');
      }
      
      const order = await orderResponse.json();

      // 2. Crear la preferencia de pago en Mercado Pago
      const mpResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              orderId: order.id,
              items: cartItems.map(item => ({
                  id: item.id,
                  title: item.name,
                  quantity: item.quantity,
                  unit_price: item.price,
              })),
              payer: {
                  email: formData.email,
                  name: formData.firstName,
                  surname: formData.lastName,
              }
          })
      });

      if (!mpResponse.ok) {
        throw new Error('No se pudo generar el link de pago.');
      }

      const data = await mpResponse.json();
      
      // 3. Redirigir al checkout de Mercado Pago
      if (data.init_point) {
        clearCart();
        router.push(data.init_point);
      } else {
        throw new Error('No se recibió un init_point de Mercado Pago.');
      }

    } catch (error) {
      console.error(error);
      // --- INICIO DE LA CORRECCIÓN ---
      let errorMessage = 'Error al procesar el pago.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      // --- FIN DE LA CORRECCIÓN ---
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Finalizar Compra</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Datos */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Datos de Contacto y Facturación</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="firstName" placeholder="Nombre" onChange={handleInputChange} required className="p-2 border rounded-md" />
            <input type="text" name="lastName" placeholder="Apellido" onChange={handleInputChange} required className="p-2 border rounded-md" />
          </div>
          <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required className="mt-4 w-full p-2 border rounded-md" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input type="text" name="cuitDni" placeholder="CUIT / DNI" onChange={handleInputChange} required className="p-2 border rounded-md" />
            <input type="text" name="phone" placeholder="Teléfono" onChange={handleInputChange} required className="p-2 border rounded-md" />
          </div>
          <button type="submit" className="mt-6 w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
            Pagar con Mercado Pago
          </button>
        </form>

        {/* Resumen del Pedido */}
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold border-b pb-2">Resumen del Pedido</h2>
          <div className="mt-4 space-y-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>${((item.price ?? 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-6 border-t pt-4 font-bold text-2xl flex justify-between">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}