import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">TRENTO Bebidas</h1>
          <div>
            <Link href="/tienda" className="text-gray-600 hover:text-blue-500 mx-4">Tienda</Link>
            <Link href="/login" className="text-gray-600 hover:text-blue-500 mx-4">Admin Login</Link>
          </div>
        </nav>
      </header>

      <section className="flex-grow flex items-center justify-center text-center bg-gray-100 px-6">
        <div>
          <h2 className="text-5xl font-extrabold text-gray-900">Distribuidora TRENTO Bebidas</h2>
          <p className="mt-4 text-xl text-gray-600">Su proveedor de confianza para eventos y comercios.</p>
          <Link href="/tienda" className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
            Ver Catálogo
          </Link>
        </div>
      </section>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2025 TRENTO Bebidas. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}