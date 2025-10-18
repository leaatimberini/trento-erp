'use client';

import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { FC } from "react";

interface ProductCatalogProps {
    products: Product[];
}

const ProductCatalog: FC<ProductCatalogProps> = ({ products }) => {
    const { addToCart } = useCart();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600 mt-1">${(product.price ?? 0).toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">Stock: {product.stockQuantity}</p>
              </div>
              <div className="p-4 bg-gray-50">
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={product.stockQuantity === 0}
                >
                  {product.stockQuantity > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
    )
}

export default ProductCatalog;