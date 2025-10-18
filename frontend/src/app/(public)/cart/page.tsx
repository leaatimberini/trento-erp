'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tu Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <div>
          <p>Tu carrito está vacío.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Productos en tu Carrito</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b py-4">
                  <div className="flex items-center">
                    {/* Placeholder for image */}
                    {/* <img src="/placeholder.jpg" alt={item.name} className="h-16 w-16 object-cover rounded-md mr-4" /> */}
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      min="1"
                      max={item.stockQuantity} // Limitar a stock disponible
                      className="w-16 text-center border rounded-md py-1"
                    />
                    <p className="font-semibold w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-bold border-b pb-2">Resumen</h2>
            <div className="mt-6 border-t pt-4 font-bold text-2xl flex justify-between">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="block text-center mt-6 w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">
              Proceder al Pago
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}