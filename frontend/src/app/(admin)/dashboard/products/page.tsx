'use client';

import ProductModal from '@/components/ProductModal';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products`;

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    setSelectedProduct(product || {});
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const isNew = !productData.id;
    const url = isNew ? apiUrl : `${apiUrl}/${productData.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to save product');
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      handleCloseModal();
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) return;
    try {
      const response = await authFetch(`${apiUrl}/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Agregar Producto
        </button>
      </div>

      {isLoading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stockQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-sm text-gray-500">No se encontraron productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </main>
  );
}