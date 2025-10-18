'use client';

import { Supplier, Product } from '@/lib/types';
import { authFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import ProductModal from '@/components/ProductModal';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  costPerUnit: number;
}

export default function NewPurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchSuppliers = async () => {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`);
        setSuppliers(await res.json());
    };
    fetchSuppliers();
  }, []);
  
  const handleProductSearch = async (term: string) => {
    setProductSearchTerm(term);
    if (term.length < 2) { setProducts([]); return; }
    const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
    const data: Product[] = await res.json();
    setProducts(data.filter(p => p.name.toLowerCase().includes(term.toLowerCase())));
  };

  const handleAddProductToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev;
      return [...prev, { productId: product.id, name: product.name, quantity: 1, costPerUnit: product.cost }];
    });
    setProductSearchTerm('');
    setProducts([]);
  };

  const handleSaveNewProduct = async (productData: Partial<Product>) => {
    try {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            method: 'POST',
            body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to create product');
        const newProduct = await response.json();
        
        setIsProductModalOpen(false);
        handleAddProductToCart(newProduct);

    } catch (error) {
        console.error("Error creating new product:", error);
        alert('Error al crear el producto.');
    }
  };
  
  const handleCartChange = (productId: string, field: 'quantity' | 'costPerUnit', value: number) => {
    setCart(prev => 
      prev.map(item => 
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!selectedSupplier || cart.length === 0) {
      alert('Por favor, seleccione un proveedor y agregue productos.');
      return;
    }
    const orderData = {
      supplierId: selectedSupplier.id,
      items: cart.map(({ productId, quantity, costPerUnit }) => ({ productId, quantity, costPerUnit })),
    };
    
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      alert('¡Orden de Compra creada con éxito!');
      router.push('/dashboard/purchase-orders');
    } else {
      const error = await response.json();
      alert(`Error al crear la orden: ${error.message}`);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Orden de Compra</h1>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">1. Seleccionar Proveedor</label>
            <select
                id="supplier"
                onChange={(e) => setSelectedSupplier(suppliers.find(s => s.id === e.target.value) || null)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
                <option value="">-- Elija un proveedor --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <hr className="my-6" />
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Agregar Producto</label>
            <input 
              type="text"
              placeholder={selectedSupplier ? "Escriba para buscar productos..." : "Seleccione un proveedor primero"}
              value={productSearchTerm}
              onChange={(e) => handleProductSearch(e.target.value)}
              disabled={!selectedSupplier}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
            />
            <div className="max-h-40 overflow-y-auto">
              {products.map(p => (
                <div key={p.id} onClick={() => handleAddProductToCart(p)} className="p-2 hover:bg-gray-100 cursor-pointer">
                  {p.name} - Costo: ${p.cost.toFixed(2)}
                </div>
              ))}
              {products.length === 0 && productSearchTerm.length > 2 && (
                <div onClick={() => setIsProductModalOpen(true)} className="p-2 text-blue-600 hover:bg-blue-50 cursor-pointer font-semibold">
                  + Crear nuevo producto "{productSearchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold border-b pb-2">Resumen de la Orden</h2>
          {selectedSupplier && <p className="mt-4"><b>Proveedor:</b> {selectedSupplier.name}</p>}
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {cart.map(item => (
              <div key={item.productId} className="p-2 border-b">
                <div className="flex justify-between items-center font-semibold">
                  <span>{item.name}</span>
                  <button onClick={() => handleRemoveFromCart(item.productId)} className="text-red-500 text-xs">Quitar</button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <div>
                    <label className="text-xs text-gray-500">Cant.</label>
                    <input type="number" value={item.quantity} onChange={e => handleCartChange(item.productId, 'quantity', Number(e.target.value))} className="w-16 p-1 border rounded-md" min="1"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Costo/u</label>
                    <input type="number" value={item.costPerUnit} onChange={e => handleCartChange(item.productId, 'costPerUnit', Number(e.target.value))} step="0.01" className="w-24 p-1 border rounded-md" min="0"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4 font-bold text-lg flex justify-between">
            <span>Costo Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button onClick={handleSubmitOrder} className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Guardar Orden de Compra
          </button>
        </div>
      </div>
      
      {isProductModalOpen && (
        <ProductModal 
            product={{ name: productSearchTerm, cost: 0, stockQuantity: 0, sku: '' }}
            onClose={() => setIsProductModalOpen(false)}
            onSave={handleSaveNewProduct}
        />
      )}
    </main>
  );
}