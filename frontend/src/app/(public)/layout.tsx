import { CartProvider } from "@/context/CartContext";
import CartLink from "@/components/CartLink";
import "../globals.css";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">TRENTO Bebidas</Link>
            <div className="flex items-center space-x-6">
                <Link href="/tienda" className="text-gray-600 hover:text-blue-500">Tienda</Link>
                <CartLink />
                <Link href="/login" className="text-sm text-gray-600 hover:text-blue-500 border-l pl-6">Admin Login</Link>
            </div>
          </nav>
        </header>
        <main className="bg-gray-50 flex-grow">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; 2025 TRENTO Bebidas. Todos los derechos reservados.</p>
        </footer>
      </div>
    </CartProvider>
  );
}