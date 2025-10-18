'use client';

import { Customer, Product } from '@/lib/types';
import { authFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';

interface CartItem extends Product {
  quantity: number;
}

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();

  const handleCustomerSearch = async (term: string) => {
    if (term.length < 2) { setCustomers([]); return; }
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data: Customer[] = await response.json();
      setCustomers(data.filter((c: Customer) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(term.toLowerCase())));
    } catch (error) {
      console.error("Error searching customers:", error);
    }
  };

  useEffect(() => {
    const fetchPricedProducts = async () => {
      if (selectedCustomer && searchTerm.length >= 2) {
        try {
          const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/products/for-customer/${selectedCustomer.id}`);
          if (!response.ok) throw new Error('Failed to fetch products');
          const data: Product[] = await response.json();
          setProducts(data.filter((p: Product) => p.name.toLowerCase().includes(searchTerm.toLowerCase())));
        } catch (error) {
          console.error("Error fetching priced products:", error);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    };

    const debounceTimer = setTimeout(() => {
        fetchPricedProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCustomer]);

  const handleAddProductToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
    setProducts([]);
  };
  
  const handleCartQuantityChange = (productId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: quantity >= 1 ? quantity : 1 } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || cart.length === 0) {
      alert('Por favor, seleccione un cliente y agregue productos.');
      return;
    }
    const orderData = {
      customerId: selectedCustomer.id,
      items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
    };
    
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert('¡Orden creada con éxito!');
        router.push('/dashboard/orders');
      } else {
        const error = await response.json();
        alert(`Error al crear la orden: ${error.message}`);
      }
    } catch (error) {
        console.error("Error submitting order:", error);
        alert('Ocurrió un error de red al enviar la orden.');
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Orden</h1>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">1. Buscar Cliente</label>
            <input type="text" placeholder="Escriba para buscar..." onChange={(e: ChangeEvent<HTMLInputElement>) => handleCustomerSearch(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            <div className="max-h-32 overflow-y-auto">
              {customers.map((c: Customer) => (
                <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomers([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">
                  {c.firstName} {c.lastName} ({c.cuitDni})
                </div>
              ))}
            </div>
          </div>
          <hr className="my-6" />
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Agregar Producto</label>
            <input 
              type="text"
              placeholder={selectedCustomer ? "Escriba para buscar productos..." : "Seleccione un cliente primero"}
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              disabled={!selectedCustomer}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
            />
            <div className="max-h-40 overflow-y-auto">
              {products.map((p: Product) => (
                <div key={p.id} onClick={() => handleAddProductToCart(p)} className="p-2 hover:bg-gray-100 cursor-pointer">
                  {p.name} - Stock: {p.stockQuantity} - <span className="font-bold">${(p.price ?? 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold border-b pb-2">Resumen de la Orden</h2>
          {selectedCustomer && <p className="mt-4"><b>Cliente:</b> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>}
          <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">${(item.price ?? 0).toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="number"
                        className="w-16 p-1 border rounded-md text-center"
                        value={item.quantity}
                        onChange={(e) => handleCartQuantityChange(item.id, parseInt(e.target.value))}
                        min="1"
                    />
                    <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4 font-bold text-lg flex justify-between">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button onClick={handleSubmitOrder} className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Finalizar y Guardar Orden
          </button>
        </div>
      </div>
    </main>
  );
}