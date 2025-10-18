import ProductCatalog from "@/components/ProductCatalog";
import { Product } from "@/lib/types";

async function getProducts() {
  // --- INICIO DE LA MODIFICACIÓN ---
  // Determinar la URL correcta dependiendo del entorno (servidor o cliente)
  const isServer = typeof window === 'undefined';
  const apiUrl = isServer 
    ? `${process.env.INTERNAL_API_URL}/products/public/all` 
    : `${process.env.NEXT_PUBLIC_API_URL}/products/public/all`;
  // --- FIN DE LA MODIFICACIÓN ---

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 10 } });
    if (!res.ok) {
      console.error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch products');
    }
    const products: Product[] = await res.json();
    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestro Catálogo</h2>
      {products.length === 0 ? (
        <p>No hay productos disponibles en este momento.</p>
      ) : (
        <ProductCatalog products={products} />
      )}
    </div>
  );
}